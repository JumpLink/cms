angular.module('webodf', [])
  .directive('webodfview', function ($compile, $window, $sailsSocket, $async) {

    var createBlob = function (type, data, callback) {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        var blob = new Blob([data.buffer], {type : 'application/vnd.oasis.opendocument.'+type});
        callback(null, blob);
      } else {
        callback('The File APIs are not fully supported in this browser.');
      }
    }

    /*
     * Download Blob to locale client pc direct from thewebodf  browser's odt file
     */
    var downloadBlob = function(type, data, callback) {
      var url;
      createBlob(type, data, function(error, blob) {
        if(error) {
          callback(error);
        } else {
          url = (window.webkitURL || window.URL).createObjectURL(blob);
          location.href = url; // <-- Download!
        }
      });
    }

    /*
     * Like downloadBlob but with filename
     */
    var downloadBlobAs = function(filename, type, data, callback) {
      var url;
      createBlob(type, data, function(error, blob) {
        if(error) {
          callback(error);
        } else {
          window.saveAs(blob, filename);
          callback(null);
        }
      });
    }

    /*
     * Request to server with file stream of the document.
     */
    var uploadBlobAs = function(folder, filename, type, data, callback) {
      var formData, req, path, resInfo;
      createBlob(type, data, function(error, blob) {
        if(error) {
          callback(error);
        } else {
          formData = new FormData();
          formData.append("documents", blob, filename);
          req = new XMLHttpRequest();
          path = folder+"/"+filename;
          req.open("PUT", path);
          req.send(formData);
          req.onload = function(res) {
            resInfo = JSON.parse(req.responseText);
            callback(null, resInfo);
          }
        }
      });
    }

    /*
     * Download document to the client without filename.
     */
    var download = function(odfContainer, callback) {
      odfContainer.createByteArray(function(data) {
        downloadBlob(odfContainer.getDocumentType(), data, callback)
      });
    }

    /*
     * Download document to the client with filename.
     */
    var downloadAs = function(odfContainer, filename, callback) {
      odfContainer.createByteArray(function(data) {
        downloadBlobAs(filename, odfContainer.getDocumentType(), data, callback)
      });
    }

    /*
     * Upload document to the server.
     */
    var uploadAs = function(odfContainer, folder, filename, callback) {
      odfContainer.createByteArray(function(data) {
        uploadBlobAs(folder, filename, odfContainer.getDocumentType(), data, callback)
      });
    }

    /*
     * Get all custom user field variables and inputs.
     * return: Object {get: array of custom user field variables, decl: array of custom user field inputs}
     */
    var getUserFieldElements = function (odfParentNodeElement, callback) {
      var textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      var userFieldsGet = odfParentNodeElement.getElementsByTagNameNS(textns, 'user-field-get');
      var userFieldsDecl = odfParentNodeElement.getElementsByTagNameNS(textns, 'user-field-decls')[0].childNodes;
      if(callback) callback(null, {get: userFieldsGet, decl: userFieldsDecl});
      return {get: userFieldsGet, decl: userFieldsDecl};
    }

    /*
     * Create new custom user field variable.
     * return: the new new custom user field variable element.
     */
    var newUserFieldDeclElement = function (odfContentNodeElement, name, value, type) {
      //TODO just if not exists
      var textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      var userFieldsDecls = odfContentNodeElement.getElementsByTagNameNS(textns, 'user-field-decls')[0];
      var newElement = document.createElementNS(textns, 'text:user-field-decl');
      newElement.setAttribute('office:value-type', type); // float
      switch(type) {
        case 'float':
          newElement.setAttribute('office:value', value);
        break;
        case 'string':
        case 'time':
        default: // TODO test more types
          newElement.setAttribute('office:'+type+'-value', value);
        break;
      }
      newElement.setAttribute('text:name', name);
      userFieldsDecls.appendChild(newElement);
      return newElement;
    }

    /*
     * Redefine custom user field inputs (custom user field get elements).
     * This function updates and renames the custom user field inputs found in userFieldGetNodeElements
     */
    var redefineUserFieldGetElement = function (userFieldGetNodeElements, name, newname, value, callback) {
      var renamed = 0;
      for (var i = 0; i < userFieldGetNodeElements.length; i++) {
        var element = userFieldGetNodeElements[i];
        var currentName = element.getAttribute('text:name');
        if(currentName === name) {
          element.textContent = value;
          element.setAttribute('text:name', newname);
          renamed++;
        }
      };
      if(callback) callback(renamed, userFieldGetNodeElements);
      return renamed;
    }

    /*
     * Update custom user field inputs (custom user field get elements).
     * This function updates the inputs that are equal to "name" in "userFieldGetNodeElements" with "value".
     */
    var updateUserFieldGetElement = function (userFieldGetNodeElements, name, value, callback) {
      var founds = 0;
      for (var i = 0; i < userFieldGetNodeElements.length; i++) {
        var element = userFieldGetNodeElements[i];
        var currentName = element.getAttribute('text:name');
        if(currentName === name) {
          element.textContent = value;
          founds++;
        }
      };
      if(callback) callback(founds, userFieldGetNodeElements);
      return founds;
    }

    /*
     * Update custom user field variables (custom user field decl elements).
     * This function updates the variables that are equal to "name" in "userFieldDeclNodeElements" with "value".
     * If the variable is not defined/found the function returns an error or call the calback with an error.
     */
    var updateUserFieldDeclElement = function (userFieldDeclNodeElements, name, value, callback) {
      var error, notFound = true;
      for (var i = 0; i < userFieldDeclNodeElements.length; i++) {
        var element = userFieldDeclNodeElements[i];
        var currentName = element.getAttribute('text:name');
        var type = element.getAttribute('office:value-type');
        if(currentName === name) {
          notFound = false;
          switch(type) {
            case 'float':
              element.setAttribute('office:value', value);
            break;
            case 'string':
            case 'time':
            default: // TODO test more types
              element.setAttribute('office:'+type+'-value', value);
            break;
          }
      }
      };
      if(notFound) {error = name+" not found";}
      if(callback) callback(error, userFieldDeclNodeElements);
      return error;
    }

    /*
     * Update custom user field variables (custom user field decl elements) and inputs (custom user field get elements).
     * This function updates the variable and inputs found in userFieldNodeElements, but only if the UserFieldDeclElement is found / variable is set.
     */
    var updateUserFieldElement = function (userFieldNodeElements, name, value, callback) {
      var error, curValue;
      if(typeof value !== 'undefined' && value !== null) {
        if(typeof value.human !== 'undefined') {
          curValue = value.human;
        } else {
          curValue = value;
        }
        updateUserFieldDeclElement(userFieldNodeElements.decl, name, curValue, function(error, userFieldDeclNodeElements){
          if(error) {
            if(callback) { callback(error); }
            return error;
          }
          updateUserFieldGetElement(userFieldNodeElements.get, name, curValue, function(founds, userFieldGetNodeElements) {
            callback(null, {get: userFieldGetNodeElements, decl: userFieldDeclNodeElements});
          });
        });
      } else {
        error = "value not set: "+name;
        callback(error);
      }
    }

    var initializeWidth = function(odfCanvas, element) {
      var paddingLeft = 0, paddingRight = 0, clientWidth = 0, innerWidth = 0;
      if(window) {
        paddingLeft = parseInt(window.getComputedStyle(element.parent()[0], null).getPropertyValue('padding-left'));
        paddingRight = parseInt(window.getComputedStyle(element.parent()[0], null).getPropertyValue('padding-right'));
      }
      clientWidth = element.parent()[0].clientWidth;
      innerWidth = clientWidth - paddingLeft - paddingRight;
      odfCanvas.fitSmart(innerWidth); // set width to 100% of parent element
    }

    var updateDocument = function(odfContentNodeElement, data, callback) {
      var userFieldNodeElements = getUserFieldElements(odfContentNodeElement);
      if(data) {
        $async.objectMap(data, function(data, callback) {
          var key = Object.keys(data)[0];
          switch(key) {
            case 'bank':
              $async.objectMap(data.bank, function(data, callback) {
                var subkey = Object.keys(data)[0];
                updateUserFieldElement(userFieldNodeElements, key+'.'+subkey, data[subkey], function(error) {
                  callback(error, data);
                });
              }, callback);
            break;
            default:
              // WORKAROUND
              // if(typeof data[key]._isAMomentObject != 'undefined' && data[key]._isAMomentObject)
              //   data[key] = data[key].format('L');
              updateUserFieldElement(userFieldNodeElements, key, data[key], function(error) {
                callback(error, data);
              });
            break;
          }
        }, callback);
      }
    }

    var removeAllChilds = function (element) {
      while (element.firstChild) {
          element.removeChild(element.firstChild);
      }
    }


    return {
      restrict: 'E',
      scope: {file : "@", invoice: "=", upload: "=", refresh: "=", ready: "=", download: "="},
      link: function ($scope, $element, $attrs) {
        var nid, odfCanvas, templateServiceTableElement, templateExpenditureTableElement, odfContentNodeElement, odfContainer;

        nid = 'odt' + Math.floor((Math.random()*100)+1);
        $element.attr('id', nid);
        odfCanvas = new odf.OdfCanvas($element[0]);
        odfCanvas.load($scope.file);

        $scope.upload = function (callback) {
          uploadAs(odfContainer, "/document/upload", "new.odt", callback);
        }

        $scope.download = function (name) {
          downloadAs(odfContainer, name, function(error) {
            if(error) { console.log(error); }
          });
        }

        $scope.refresh = function (callback) {
          updateDocument(odfContentNodeElement, $scope.invoice, callback);
        }

        angular.element($window).bind('resize', function() {
          initializeWidth(odfCanvas, $element);
          // $scope.$apply();
        });

        // Callback fired after odf document is ready
        odfCanvas.addListener("statereadychange", function () {

          odfCanvas.refreshSize();
          initializeWidth(odfCanvas, $element);

          odfContainer = odfCanvas.odfContainer();
          odfContentNodeElement = odfContainer.getContentElement();

          $scope.ready();

        });

      }
    };
  });
