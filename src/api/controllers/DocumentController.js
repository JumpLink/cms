/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var UPLOADFOLDER =  __dirname+'/../../.tmp/uploads';

module.exports = {
  /**
   * `OdfController.create()`
   */
  upload: function (req, res) {
    req.file("documents").upload(function (err, files) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      for (var i = 0; i < files.length; i++) {
        files[i].uploadedAs = path.basename(files[i].fd);
      };

      // EmailService.send(from, subject, text, html);

      return res.json({
        message: files.length + ' file(s) uploaded successfully!',
        files: files
      });
    });
  },
  // filters source: http://listarchives.libreoffice.org/global/users/msg15151.html
  // org.openoffice.da.writer2xhtml.epub
  // org.openoffice.da.calc2xhtml11
  // Text - txt - csv (StarCalc)
  // impress_svg_Export
  // math8
  // EPS - Encapsulated PostScript
  // StarOffice XML (Base) Report Chart
  // org.openoffice.da.writer2xhtml.mathml.xsl
  // impress_svm_Export
  // MS Excel 95 (StarWriter)
  // impress_pdf_addstream_import
  // JPG - JPEG
  // placeware_Export
  // StarOffice XML (Math)
  // T602Document
  // impress_jpg_Export
  // writer_globaldocument_StarOffice_XML_Writer
  // draw_emf_Export
  // MS Word 2003 XML
  // WMF - MS Windows Metafile
  // GIF - Graphics Interchange
  // writer_pdf_import
  // calc8
  // writer_globaldocument_StarOffice_XML_Writer_GlobalDocument
  // MS Word 97 Vorlage
  // impress_tif_Export
  // draw_xpm_Export
  // Calc MS Excel 2007 XML
  // Text (encoded)
  // MathML XML (Math)
  // MET - OS/2 Metafile
  // MS PowerPoint 97 AutoPlay
  // impress8
  // StarOffice XML (Calc)
  // calc_HTML_WebQuery
  // RAS - Sun Rasterfile
  // MS Excel 5.0 (StarWriter)
  // impress_png_Export
  // DXF - AutoCAD Interchange
  // impress_pct_Export
  // impress_met_Export
  // SGF - StarOffice Writer SGF
  // draw_eps_Export
  // Calc MS Excel 2007 Binary
  // calc8_template
  // Calc MS Excel 2007 XML Template
  // impress_pbm_Export
  // draw_pdf_import
  // Calc Office Open XML
  // math_pdf_Export
  // Rich Text Format (StarCalc)
  // MS PowerPoint 97 Vorlage
  // StarOffice XML (Base)
  // DIF
  // Impress MS PowerPoint 2007 XML Template
  // MS Excel 2003 XML
  // impress_ras_Export
  // draw_PCD_Photo_CD_Base16
  // draw_bmp_Export
  // WordPerfect Graphics
  // StarOffice XML (Writer)
  // PGM - Portable Graymap
  // Office Open XML Text Template
  // MS Excel 5.0/95
  // draw_svg_Export
  // draw_PCD_Photo_CD_Base4
  // TGA - Truevision TARGA
  // Quattro Pro 6.0
  // writer_globaldocument_pdf_Export
  // calc_pdf_addstream_import
  // writerglobal8_HTML
  // draw_svm_Export
  // HTML
  // EMF - MS Windows Metafile
  // PPM - Portable Pixelmap
  // Lotus
  // impress_ppm_Export
  // draw_jpg_Export
  // Text
  // TIF - Tag Image File
  // Impress Office Open XML AutoPlay
  // StarOffice XML (Base) Report
  // PNG - Portable Network Graphic
  // draw8
  // Rich Text Format
  // writer_web_StarOffice_XML_Writer_Web_Template
  // org.openoffice.da.writer2xhtml
  // MS_Works
  // Office Open XML Text
  // SVG - Scalable Vector Graphics
  // org.openoffice.da.writer2xhtml11
  // draw_tif_Export
  // impress_gif_Export
  // StarOffice XML (Draw)
  // StarOffice XML (Impress)
  // Text (encoded) (StarWriter/Web)
  // writer_web_pdf_Export
  // MediaWiki_Web
  // impress_pdf_Export
  // draw_pdf_addstream_import
  // draw_png_Export
  // HTML (StarCalc)
  // HTML (StarWriter)
  // impress_StarOffice_XML_Impress_Template
  // draw_pct_Export
  // calc_StarOffice_XML_Calc_Template
  // MS Excel 95 Vorlage/Template
  // writerglobal8_writer
  // MS Excel 95
  // draw_met_Export
  // dBase
  // MS Excel 97
  // MS Excel 4.0
  // draw_pbm_Export
  // impress_StarOffice_XML_Draw
  // Impress Office Open XML
  // writerweb8_writer
  // chart8
  // MediaWiki
  // MS Excel 4.0 Vorlage/Template
  // impress_wmf_Export
  // draw_ras_Export
  // writer_StarOffice_XML_Writer_Template
  // BMP - MS Windows
  // impress8_template
  // LotusWordPro
  // impress_pgm_Export
  // SGV - StarDraw 2.0
  // draw_PCD_Photo_CD_Base
  // draw_html_Export
  // writer8_template
  // Calc Office Open XML Template
  // writerglobal8
  // draw_flash_Export
  // MS Word 2007 XML Template
  // impress8_draw
  // CGM - Computer Graphics Metafile
  // MS PowerPoint 97
  // WordPerfect
  // impress_emf_Export
  // writer_pdf_Export
  // PSD - Adobe Photoshop
  // PBM - Portable Bitmap
  // draw_ppm_Export
  // writer_pdf_addstream_import
  // PCX - Zsoft Paintbrush
  // writer_web_HTML_help
  // MS Excel 4.0 (StarWriter)
  // Impress Office Open XML Template
  // org.openoffice.da.writer2xhtml.mathml
  // MathType 3.x
  // impress_xpm_Export
  // writer_web_StarOffice_XML_Writer
  // writerweb8_writer_template
  // MS Word 95
  // impress_html_Export
  // MS Word 97
  // draw_gif_Export
  // writer8
  // MS Excel 5.0/95 Vorlage/Template
  // draw8_template
  // StarOffice XML (Chart)
  // XPM
  // draw_pdf_Export
  // calc_pdf_Export
  // impress_eps_Export
  // XBM - X-Consortium
  // Text (encoded) (StarWriter/GlobalDocument)
  // writer_MIZI_Hwp_97
  // MS WinWord 6.0
  // Lotus 1-2-3 1.0 (WIN) (StarWriter)
  // SYLK
  // MS Word 2007 XML
  // Text (StarWriter/Web)
  // impress_pdf_import
  // MS Excel 97 Vorlage/Template
  // Impress MS PowerPoint 2007 XML AutoPlay
  // Impress MS PowerPoint 2007 XML
  // draw_wmf_Export
  // Unifa Adressbuch
  // org.openoffice.da.calc2xhtml
  // impress_bmp_Export
  // Lotus 1-2-3 1.0 (DOS) (StarWriter)
  // MS Word 95 Vorlage
  // MS WinWord 5
  // PCT - Mac Pict
  // SVM - StarView Metafile
  // draw_StarOffice_XML_Draw_Template
  // impress_flash_Export
  // draw_pgm_Export
  convert: function (req, res) {
    var stdout = '';
    var stderr = '';
    sails.log.info('convert');
    if(!req.param('filename')) res.badRequest('filename is required');
    var source = req.param('filename');
    var inputDir = UPLOADFOLDER +'/'+source;
    var outputFileExtension = req.param('extension') ? req.param('extension') : 'pdf'; // example 'pdf';
    var outputFilterName = req.param('filter') ? ':'+req.param('filter') : '';  //(optinal) example ':'+'MS Excel 95';
    var outputDir = UPLOADFOLDER;
    if(req.param('dir')) {
      outputDir += '/'+req.param('dir');
    }
    outputDir = path.normalize(outputDir);
    inputDir = path.normalize(inputDir);
    var target = outputDir+"/"+path.basename(source, '.odt')+"."+outputFileExtension;
    var command = 'soffice --headless --invisible --convert-to '+outputFileExtension+outputFilterName+' --outdir '+outputDir+' '+inputDir;
    sails.log.info(command);
    var child = exec(command, function (code, stdout, stderr) {
      if(code) {
        sails.log.error(code);
      }
      if(stderr) {
        sails.log.error(stderr);
      }
      if(stdout) {
        sails.log.info(stdout);
      }
      res.json({target:target, code: code, stdout: stdout, stderr: stderr});
      // res.download(target); // not working over socket.io
    });
  }
};
