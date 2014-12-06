/*
    Copyright (C) 2014  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//dependencies
var wpXMLParse = pb.plugins.getService('wp_xml_parse', 'wp_import');

/**
 * @class ImportWP
 * @constructor
 * @extends BaseController
 */
function ImportWP(){}

//inheritance
util.inherits(ImportWP, pb.BaseController);

/**
 * @see BaseController#render
 * @method render
 * @param {Function} cb
 */
ImportWP.prototype.render = function(cb) {
    var self  = this;
    var files = [];

    var form = new formidable.IncomingForm();
    form.on('file', function(field, file) {
        files.push(file);
    });
    form.on('error', function(err) {
        self.session.error = 'loc_NO_FILE';
        cb({content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, 'No file provided')});
    });
    form.parse(this.req, function() {

        fs.readFile(files[0].path, function(err, data) {
            if(util.isError(err)) {
                self.session.error = 'NO_FILE';
                cb({content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, 'No file provided')});
                return;
            }

            wpXMLParse.parse(data.toString(), self.session.authentication.user_id, function(err, users) {
                if(err) {
                    self.session.error = err;
                    cb({content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, 'Error saving')});
                    return;
                }

                self.session.success = 'WP_IMPORT_SUCCESS';
                self.session.importedUsers = users;
                cb({content: pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, 'Successfully imported WordPress content')});
            });
        });
    });
};

ImportWP.getRoutes = function(cb) {
    var routes = [
        {
            method: 'post',
            path: '/actions/admin/plugins/settings/wp_import/import',
            auth_required: true,
            access_level: ACCESS_MANAGING_EDITOR,
            content_type: 'text/html'
        }
    ];
    cb(null, routes);
};

//exports
module.exports = ImportWP;
