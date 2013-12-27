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
 * Portions created by the Initial Developer are Copyright (C) 2006-2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */


const FMTOPT_NO_FORMATTING = 0;
const FMTOPT_NUMBERED      = 1;
const FMTOPT_BULLETED      = 2;

var gStrBundle, gFmtRadiogroup, gAlwaysAsk, gPreviewThumbnail;
var gMailClient;


function $(aID) 
{
  return document.getElementById(aID);
}


function initDlg() 
{
  gStrBundle = $("ae-sendtabs-strings");
  gFmtRadiogroup = $("format-radiogroup");
  gPreviewThumbnail = $("preview-thumbnail");
  gAlwaysAsk = $("always-ask");
  gMailClient   = $("mail-client");

  var fmtPref = Application.prefs.getValue("sendtabs.message.format.list_style", 0);
  gFmtRadiogroup.selectedIndex = fmtPref;
  setPreviewImage(fmtPref);
  gAlwaysAsk.checked = Application.prefs.getValue("sendtabs.message.format.always_ask", true);
  gMailClient.selectedIndex = Application.prefs.getValue("sendtabs.mailclient", 0);

  var isGoogleAppsEnabled = Application.prefs.getValue("sendtabs.mailclient.googleapps.enabled", false);
  if (isGoogleAppsEnabled) {
    $("googapps").hidden = false;
  }

  // window.arguments is defined only if invoked from main browser window
  var dlg = $("ae-sendtabs-format-options-dialog");

  if (window.arguments) {
    var btn = dlg.getButton("accept");
    btn.label = gStrBundle.getString("acceptBtnLabel");
  }
  else {
    document.title = gStrBundle.getString("fmtSettingsDlgTitle");
    gAlwaysAsk.hidden = true;
  }
}


function setPreviewImage(aFormatPref)
{
  switch (aFormatPref) {
  case FMTOPT_NUMBERED:
    gPreviewThumbnail.className = "fmt-numbered";
    break;

  case FMTOPT_BULLETED:
    gPreviewThumbnail.className = "fmt-bulleted";
    break;

  default:
    gPreviewThumbnail.className = "fmt-none";
    break;
  }
}


function cycleFormat()
{
  var className = gPreviewThumbnail.className;

  switch (className) {
  case "fmt-numbered":
    gFmtRadiogroup.selectedIndex = FMTOPT_BULLETED;
    gPreviewThumbnail.className = "fmt-bulleted";
    break;

  case "fmt-bulleted":
    gFmtRadiogroup.selectedIndex = FMTOPT_NO_FORMATTING;
    gPreviewThumbnail.className = "fmt-none";
    break;

  case "fmt-none":
    gFmtRadiogroup.selectedIndex = FMTOPT_NUMBERED;
    gPreviewThumbnail.className = "fmt-numbered";
    break;

  default:
    break;
  }
}


function doOK() 
{
  Application.prefs.setValue("sendtabs.message.format.list_style", gFmtRadiogroup.selectedIndex);

  if (! gAlwaysAsk.hidden) {
    // The "Always ask" checkbox would be hidden if this dialog was opened
    // from extension preferences.
    Application.prefs.setValue("sendtabs.message.format.always_ask", gAlwaysAsk.checked);
  }

  Application.prefs.setValue("sendtabs.mailclient", gMailClient.selectedIndex);

  return true;
}

function doCancel() 
{
  if (window.arguments) {
    window.arguments[0].cancel = true;
  }

  return true;
}
