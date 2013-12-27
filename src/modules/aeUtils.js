
const EXPORTED_SYMBOLS = ["aeUtils"];

const DEBUG = false;
const EXTENSION_ID = "{4aebcd37-f454-4928-9233-174a026ed367}";


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




