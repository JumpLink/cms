angular.module('webodf', [])
  .directive('webodfview', function ($compile, $window, $sailsSocket) {

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
          console.logerror
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
            console.log(resInfo);
            // convert to pdf
            $sailsSocket.put("/document/convert/", {filename: resInfo.files[0].uploadedAs, extension: 'pdf'}, function (response) {
              console.log(response);
            });
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
      }, callback);
    }

    /*
     * Download document to the client with filename.
     */
    var downloadAs = function(odfContainer, filename, callback) {
      odfContainer.createByteArray(function(data) {
        downloadBlobAs(filename, odfContainer.getDocumentType(), data, callback)
      }, callback);
    }

    /*
     * Upload document to the server.
     */
    var uploadAs = function(odfContainer, folder, filename, callback) {
      odfContainer.createByteArray(function(data) {
        uploadBlobAs(folder, filename, odfContainer.getDocumentType(), data, callback)
      }, callback);
    }

    /*
     * Get all custom user field variables and inputs.
     * return: Object {get: array of custom user field variables, decl: array of custom user field inputs}
     */
    var getUserFieldElements = function (odfParentNodeElement, callback) {
      var textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      var userFieldsGet = odfParentNodeElement.getElementsByTagNameNS(textns, 'user-field-get');
      var userFieldsDecl = odfParentNodeElement.getElementsByTagNameNS(textns, 'user-field-decls')[0].childNodes;
      if(callback) callback(null, {get: UserFieldsGet, decl: UserFieldsDecl});
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
      if(typeof value != undefined && value != null) {
        if(typeof value.human !== 'undefined')
          curValue = value.human
        else
          curValue = value
        updateUserFieldDeclElement(userFieldNodeElements.decl, name, curValue, function(error, userFieldDeclNodeElements){
          if(error) {
            if(callback) callback(error);
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

    /*
     * Get all tables from parent node
     * return: array of table nodes
     */
    var getTableElements = function(odfParentNodeElement, callback) {
      var tablens = 'urn:oasis:names:tc:opendocument:xmlns:table:1.0';
      var tableElements = odfParentNodeElement.getElementsByTagNameNS(tablens, 'table');
      if(callback) callback(null, tableElements);
      return tableElements;
    }

    /*
     * Get table node by table name.
     * Required: array of table nodes
     */
    var getTableElementByName = function(tableElements, name, callback) {
      var error, notFound = true;
      for (var i = 0; i < tableElements.length; i++) {
        var element = tableElements[i];
        var currentName = element.getAttribute('table:name');
        if(currentName === name) {
          notFound = false;
          callback(error, element);
          return error;
        }
      };
      if(notFound) {
        error = "not found";
        callback(error);
        return error;
      }
    }

    /*
     * Custom insertAfter function as a contrast to the native insertBefore method
     * source: http://blog.svidgen.com/2007/10/javascript-insertafter.html
     */
    var insertAfter = function (newNodeElement, existingNodeElement) {
      // if the existing node has a following sibling, insert the current
      // node before it. otherwise appending it to the parent node
      // will correctly place it just after the existing node.
      if (existingNodeElement.nextSibling) {
        // there is a next sibling. insert before it using the mutual
        // parent's insertBefore() method.
        existingNodeElement.parentNode.insertBefore(newNodeElement, existingNodeElement.nextSibling);
      } else {
        // there is no next sibling. append to the end of sthe parent's
        // node list.
        existingNodeElement.parentNode.appendChild(newNodeElement);
      }
    }

    var getArea = function (odfContentNodeElement, name) {
      var textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      var sections = odfContentNodeElement.getElementsByTagNameNS(textns, 'section');
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        if(section.getAttribute('text:name') == name)
          return section;
      };
      return null;
    }

    /*
     * Create a new service or expenditure table based on "templateElement" and append as child to area
     */
    var appendNewTableElement = function (odfContentNodeElement, area, templateElement, number, values, tablename, newVarKey, oldVarKey) {
      var textns = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      var newTableElement = templateElement.cloneNode(true);
      var newTableUserFieldsGet = newTableElement.getElementsByTagNameNS(textns, 'user-field-get');
      newTableElement.setAttribute('table:name', tablename+'.'+number);

      // create new custom user field for number
      newUserFieldDeclElement(odfContentNodeElement, "invoice."+newVarKey+"."+number+".number", number, "float");
      // rename old custom user field to new created
      redefineUserFieldGetElement(newTableUserFieldsGet, "invoice."+oldVarKey+".number", "invoice."+newVarKey+"."+number+".number", number);

      // create user fields for each key in values
      for (key in values) {
        newUserFieldDeclElement(odfContentNodeElement, "invoice."+newVarKey+"."+number+"."+key, values[key], "string");
        redefineUserFieldGetElement(newTableUserFieldsGet, "invoice."+oldVarKey+"."+key, "invoice."+newVarKey+"."+number+"."+key, values[key]);
      }

      area.appendChild(newTableElement);
    }

    /*
     * Create a new service table based on "templateElement" and append as child to "servicearea".
     */
    var appendNewServiceTableElement = function (odfContentNodeElement, area, templateElement, number, values) {
      appendNewTableElement(odfContentNodeElement, area, templateElement, number, values, "servicetable", "services", "service");
    }

    /*
     * Create a new expenditure table based on "templateElement" (name is "expendituretable") and append as child to "expenditurearea".
     */
    var appendNewExpenditureTableElement = function (odfContentNodeElement, area, templateElement, number, values) {
      appendNewTableElement(odfContentNodeElement, area, templateElement, number, values, "expendituretable", "expenditures", "expenditure");
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

    var updateDocument = function(odfContentNodeElement, invoice) {
      var userFieldNodeElements = getUserFieldElements(odfContentNodeElement);
      if(invoice) {
        for(var key in invoice) {
          switch(key) {
            case 'services':
            case 'expenditures':
              // do nothing, see updateDocumentServices function
            break;
            case 'approver':
              // update all invoice.approver fields
              for(var subkey in invoice.approver) {
                if(subkey == 'bank') {
                  // update all invoice.approver.bank fields
                  for(var subsubkey in invoice.approver.bank) {
                    updateUserFieldElement(userFieldNodeElements, 'invoice.approver.bank.'+subsubkey, invoice.approver.bank[subsubkey], function(error) {
                      if(error) console.log(error);
                    });
                  }
                } else {
                  updateUserFieldElement(userFieldNodeElements, 'invoice.approver.'+subkey, invoice.approver[subkey], function(error) {
                    if(error) console.log(error);
                  });
                }
              }
            break;
            case 'recipient':
              // update all invoice.recipient fields
              for(var subkey in invoice.recipient) {
                updateUserFieldElement(userFieldNodeElements, 'invoice.recipient.'+subkey, invoice.recipient[subkey], function(error) {
                  if(error) console.log(error);
                });
              }
            break;
            case 'translate':
              // translate all defined translations
              for(var subkey in invoice.translate) {
                updateUserFieldElement(userFieldNodeElements, 'invoice.translate.'+subkey, invoice.translate[subkey], function(error) {
                  if(error) console.log(error);
                });
              }
            break;
            default:
              updateUserFieldElement(userFieldNodeElements, 'invoice.'+key, invoice[key], function(error) {
                if(error) console.log(error);
              });
            break;
          }
        }
      }
    }

    var removeAllChilds = function (element) {
      while (element.firstChild) {
          element.removeChild(element.firstChild);
      }
    }

    var updateDocumentServices = function(odfContentNodeElement, templateServiceTableElement, services) {
      var areaElement = getArea(odfContentNodeElement, 'servicearea');
      // remove all old services be shure to save the template service before
      removeAllChilds(areaElement);
      if(services) {
        for (var i = 0; i < services.length; i++) {
          appendNewServiceTableElement(odfContentNodeElement, areaElement, templateServiceTableElement, i+1, services[i]);
        };
      } else {
        console.log("services not defined");
      }
    }

    var updateDocumentExpenditurs = function(odfContentNodeElement, templateExpenditureTableElement, expenditures) {
      var areaElement = getArea(odfContentNodeElement, 'expenditurearea');
      // remove all old expenditures be shure to save the template expenditure before
      removeAllChilds(areaElement);
      if(expenditures) {
        for (var i = 0; i < expenditures.length; i++) {
          appendNewExpenditureTableElement(odfContentNodeElement, areaElement, templateExpenditureTableElement, i+1, expenditures[i]);
        };
      } else {
        console.log("expenditures not defined");
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

        $scope.upload = function () {
          console.log("upload");
          uploadAs(odfContainer, "/document/upload", "new.odt", function(error) {
            if(error) console.log(error);
          });
        }

        $scope.download = function () {
          console.log("download");
          downloadAs(odfContainer, "new.odt", function(error) {
            if(error) console.log(error);
          });
        }

        $scope.refresh = function () {
          console.log("refresh");
          updateDocument(odfContentNodeElement, $scope.invoice);
          updateDocumentServices(odfContentNodeElement, templateServiceTableElement, $scope.invoice.services);
          updateDocumentExpenditurs(odfContentNodeElement, templateExpenditureTableElement, $scope.invoice.expenditures);
        }

        angular.element($window).bind('resize', function() {
          initializeWidth(odfCanvas, $element);
          $scope.$apply();
        });

        // Callback fired after odf document is ready
        odfCanvas.addListener("statereadychange", function () {

          odfCanvas.refreshSize();
          initializeWidth(odfCanvas, $element);

          odfContainer = odfCanvas.odfContainer();
          odfContentNodeElement = odfContainer.getContentElement();

          // get service template and store ot globaly
          getTableElementByName(getTableElements(odfCanvas.odfContainer().getContentElement()), 'servicetable', function(error, serviceTableElement) {
            templateServiceTableElement = serviceTableElement;
            getTableElementByName(getTableElements(odfCanvas.odfContainer().getContentElement()), 'expendituretable', function(error, expenditureTableElement) {
              templateExpenditureTableElement = expenditureTableElement;
              $scope.ready();
            });
          });
        });

      }
    };
  });
