/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Send Tab URLs.
 *
 * The Initial Developer of the Original Code is 
 * Alex Eng <ateng@users.sourceforge.net>.
 * Portions created by the Initial Developer are Copyright (C) 2006-2014
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

const EXPORTED_SYMBOLS = ["aeWindowsApp"];


var aeWindowsApp = {
 createInstance: function ()
 {
   return new WindowsApp();
 }
};


function WindowsApp() {
  // Private member variables
  this._appPath = "";
  this._args    = [];
}

WindowsApp.prototype = {
  // Constants
  E_NOT_INITIALIZED: "WindowsApp instance not initialized",
  E_FILE_NOT_FOUND:  "File not found"
};


WindowsApp.prototype.setPath = function (aPath)
{
  this._appPath = aPath;
};


WindowsApp.prototype.setArgs = function (aArgs/*, ... */)
{
  for (var i = 0; i < arguments.length; i++) {
    this._args.push(arguments[i]);
  }
};


WindowsApp.prototype.exec = function ()
{
  // Note that this._args[] could be an empty array if no command line
  // arguments are needed to start the app
  if (! this._appPath) {
    throw this.E_NOT_INITIALIZED;
  }

  var exeFile = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
  exeFile.initWithPath(this._appPath);
  exeFile = exeFile.QueryInterface(Components.interfaces.nsIFile);

  if (! exeFile.exists()) {
    throw this.E_FILE_NOT_FOUND + ": \"" + this._appPath + "\"";
  }

  var ps = Components.classes['@mozilla.org/process/util;1']
                     .createInstance(Components.interfaces.nsIProcess);
  try {
    ps.init(exeFile);
    
    // Run email app in a non-blocking process
    var pid = ps.run(false, this._args, this._args.length);
  }
  catch (e) { 
    throw e;
  }

  return pid;
};
