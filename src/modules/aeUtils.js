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
 * Portions created by the Initial Developer are Copyright (C) 2008-2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("resource://gre/modules/Services.jsm");


const EXPORTED_SYMBOLS = ["aeUtils"];

const DEBUG = true;
const PREFNAME_PREFIX = "extensions.aecreations.";
const EXTENSION_ID = "{4aebcd37-f454-4928-9233-174a026ed367}";

const Cc = Components.classes;
const Ci = Components.interfaces;


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


aeUtils.getHostAppID = function ()
{
  var xulAppInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

  return xulAppInfo.ID;
};


aeUtils.getHostAppName = function ()
{
  var xulAppInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

  return xulAppInfo.name;
};


aeUtils.getHostAppVersion = function ()
{
  var xulAppInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

  return xulAppInfo.version;
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
  let prefName = PREFNAME_PREFIX + aPrefKey;
  let prefs = Services.prefs;
  let prefType = prefs.getPrefType(prefName);
  let rv = undefined;

  if (prefType == prefs.PREF_STRING) {
    rv = prefs.getCharPref(prefName);
  }
  else if (prefType == prefs.PREF_INT) {
    rv = prefs.getIntPref(prefName);
  }
  else if (prefType == prefs.PREF_BOOL) {
    rv = prefs.getBoolPref(prefName);
  }
  else {
    // Pref doesn't exist if prefType == prefs.PREF_INVALID.
    rv = aDefaultValue;
  }

  return rv;
};


aeUtils.setPref = function (aPrefKey, aPrefValue)
{
  let prefName = PREFNAME_PREFIX + aPrefKey;
  let prefs = Services.prefs;
  let prefType = prefs.getPrefType(prefName);

  if (prefType == prefs.PREF_INT) {
    prefs.setIntPref(prefName, aPrefValue);
  }
  else if (prefType == prefs.PREF_BOOL) {
    prefs.setBoolPref(prefName, aPrefValue);
  }
  else if (prefType == prefs.PREF_STRING) {
    prefs.setCharPref(prefName, aPrefValue);
  }
};


aeUtils.hasPref = function (aPrefKey)
{
  let prefName = PREFNAME_PREFIX + aPrefKey;
  let prefs = Services.prefs;

  return (prefs.getPrefType(prefName) != prefs.PREF_INVALID);
};
  

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




