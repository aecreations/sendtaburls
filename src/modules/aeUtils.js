/* -*- mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * Portions created by the Initial Developer are Copyright (C) 2008-2014
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

const EXPORTED_SYMBOLS = ["aeUtils"];

const DEBUG = false;
const PREFNAME_PREFIX = "extensions.aecreations.";
const EXTENSION_ID = "{4aebcd37-f454-4928-9233-174a026ed367}";

const Cc = Components.classes;
const Ci = Components.interfaces;

var Application = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);


var aeUtils; 

if (! aeUtils) {
  aeUtils = {
    // Declare any extension-specific constants here.
  };
}


aeUtils.alertEx = function (aTitle, aMessage)
{
  var prmpt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
  prmpt.alert(null, aTitle, aMessage);
};


aeUtils.confirmEx = function (aTitle, aMessage)
{
  var rv;
  var prmpt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
  rv = prmpt.confirm(null, aTitle, aMessage);
  return rv;
};


aeUtils.getExtensionID = function ()
{
  return EXTENSION_ID;
};


aeUtils.getUserProfileDir = function ()
{
  // Throws an exception if profile directory retrieval failed.
  var dirProp = Components.classes["@mozilla.org/file/directory_service;1"]
                          .getService(Components.interfaces.nsIProperties);
  var profileDir = dirProp.get("ProfD", Components.interfaces.nsIFile);
  if (! profileDir) {
    throw "Failed to retrieve user profile directory path";
  }

  return profileDir;
};


aeUtils.getOS = function ()
{
  var rv;
  var xulRuntime = Components.classes["@mozilla.org/xre/app-info;1"]
                             .createInstance(Components.interfaces
					               .nsIXULRuntime);
  rv = xulRuntime.OS;

  return rv;
};


aeUtils.getPref = function (aPrefKey, aDefaultValue)
{
  // aPrefKey is the pref name, but without the "extensions.aecreations."
  // prefix.
  return Application.prefs.getValue(PREFNAME_PREFIX + aPrefKey, aDefaultValue);
};


aeUtils.setPref = function (aPrefKey, aPrefValue)
{
  Application.prefs.setValue(PREFNAME_PREFIX + aPrefKey, aPrefValue);
},
  

aeUtils.beep = function () 
{
  var sound = Components.classes["@mozilla.org/sound;1"]
                        .createInstance(Components.interfaces.nsISound);
  sound.beep();
};


aeUtils.log = function (aMessage) {
  if (DEBUG) {
    var consoleSvc = Components.classes["@mozilla.org/consoleservice;1"]
                               .getService(Components.interfaces
					             .nsIConsoleService);
    consoleSvc.logStringMessage(aMessage);
  }
};




