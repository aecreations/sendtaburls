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


Components.utils.import("resource://sendtabs/modules/aeUtils.js");


const CLIPBOARD_URLCOUNT_DISABLED = 0;
const CLIPBOARD_URLCOUNT_TOP = 1;
const CLIPBOARD_URLCOUNT_BOTTOM = 2;

var gStrBundle, gShowTabMenuCmd, gAlwaysAskFmt, gWebMail, gConfCopy, gInclUrlCount, gUrlCountPos;
var gGoogAppsDomain;


function $(aID)
{
  return document.getElementById(aID);
}


function initDlg()
{
  gStrBundle = document.getElementById("ae-sendtabs-strings");

  gShowTabMenuCmd = $("show-tab-menu-cmd");
  gAlwaysAskFmt = $("always-ask-formatting");
  gWebMail = $("webmail-radiogroup");
  gConfCopy = $("confirm-copy");
  gInclUrlCount = $("include-url-count");
  gUrlCountPos = $("url-count-position");
  gGoogAppsDomain = $("google-apps-domain");

  // Firefox 4 and newer
  if (parseInt(Application.version) >= 4) {
    gShowTabMenuCmd.checked = aeUtils.getPref("sendtabs.show_tab_menu_command", true);
  }
  else {
    gShowTabMenuCmd.hidden = true;
  }

  gAlwaysAskFmt.checked = aeUtils.getPref("sendtabs.message.format.always_ask", true);

  var openInNewWnd = aeUtils.getPref("sendtabs.webmail.open_in_new_window", false);
  gWebMail.selectedIndex = openInNewWnd ? 1 : 0;

  gConfCopy.checked = aeUtils.getPref("sendtabs.mailclient.clipboard.confirm_copy", true);

  var clipbdUrlCountPos = aeUtils.getPref("sendtabs.mailclient.clipboard.url_count_position", 1);
  if (clipbdUrlCountPos != CLIPBOARD_URLCOUNT_DISABLED) {
    gInclUrlCount.checked = true;
    gUrlCountPos.selectedIndex = clipbdUrlCountPos - 1;
  }

  toggleClipboardURLCountPositonState(gInclUrlCount);

  var isGoogleAppsEnabled = aeUtils.getPref("sendtabs.mailclient.googleapps.enabled", true);
  if (isGoogleAppsEnabled) {
    gGoogAppsDomain.value = aeUtils.getPref("sendtabs.mailclient.googleapps.domain", "");
  }
  else {
    $("tab-google-apps").hidden = true;
  }
}


function showFormatSettingsDlg()
{
  window.open("chrome://sendtabs/content/formatOpts.xul", "dlg_fmtsettings", "chrome,dialog,modal,centerscreen");
}


function toggleClipboardURLCountPositonState(aCheckboxElt)
{
  var isDisabled = !aCheckboxElt.checked;

  $("url-count-position-label-pre").disabled = isDisabled;
  $("url-count-position-label-post").disabled = isDisabled;
  $("url-count-position").disabled = isDisabled;
}


function showChangedPrefMsg()
{
  // Don't show the message if the checkbox was previously ticked, and the user
  // unticked it, and then ticked it again
  var isTabMenuCmdVisible = aeUtils.getPref("sendtabs.show_tab_menu_command", true);
  if (gShowTabMenuCmd.checked && !isTabMenuCmdVisible) {
    aeUtils.alertEx(document.title, gStrBundle.getString("prefChangeMsg"));
  }
}


function doOK()
{
  var openInNewWnd = gWebMail.selectedIndex == 1;
  var clipbdUrlCountPos = 0;
  if (gInclUrlCount.checked) {
    clipbdUrlCountPos = gUrlCountPos.selectedIndex + 1;
  }

  if (! gShowTabMenuCmd.hidden) {
    aeUtils.setPref("sendtabs.show_tab_menu_command", gShowTabMenuCmd.checked);
  }

  aeUtils.setPref("sendtabs.message.format.always_ask", gAlwaysAskFmt.checked);
  aeUtils.setPref("sendtabs.webmail.open_in_new_window", openInNewWnd);
  aeUtils.setPref("sendtabs.mailclient.clipboard.confirm_copy", gConfCopy.checked);
  aeUtils.setPref("sendtabs.mailclient.clipboard.url_count_position", clipbdUrlCountPos);
  aeUtils.setPref("sendtabs.mailclient.googleapps.domain", gGoogAppsDomain.value);

  return true;
}


function doCancel()
{
  return true;
}
