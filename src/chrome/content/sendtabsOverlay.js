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
 * Portions created by the Initial Developer are Copyright (C) 2004-2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */


if (! ('aecreations' in window)) {
  window.aecreations = {};
}

if (! ('sendtaburls' in window.aecreations)) {
  window.aecreations.sendtaburls = {};
}
else {
  throw new Error("sendtaburls object already defined");
}


window.aecreations.sendtaburls = {
  GMAIL_MAX_MSGLEN:  807,

  // List style constants
  FMTOPT_NO_FORMATTING:  0,
  FMTOPT_NUMBERED:       1,
  FMTOPT_BULLETED:       2,

  // Send to constants
  SENDTO_CLIPBOARD: 1,
  SENDTO_GMAIL: 2,
  SENDTO_GOOGLEAPPS: 3,

  // URL count position (applicable to clipboard only)
  CLIPBOARD_URLCOUNT_DISABLED: 0,
  CLIPBOARD_URLCOUNT_TOP: 1,
  CLIPBOARD_URLCOUNT_BOTTOM: 2,

  _strBundle:  null,


  // Method handleEvent() effectively makes this object an implementation of
  // the EventListener interface; therefore it can be passed as the listener
  // argument to window.addEventListener() and window.removeEventListener()
  handleEvent: function (aEvent)
  {
    // When this method is invoked, 'this' will not refer to the sendtaburls
    // object.  The 'that' object will refer to 'this'. =)
    let that = window.aecreations.sendtaburls;

    if (aEvent.type == "load") {
      that.initSendTabs();
    }
    else if (aEvent.type == "unload") {
      var tabMenuElt = document.getElementById("alltabs-popup");
      tabMenuElt.removeEventListener("popupshowing", that.initTabMenuCmd, false);

      window.removeEventListener("load", that, false);
      window.removeEventListener("unload", that, false);
    }
  },


  isAustralisUI: function ()
  {
    return document.getElementById("PanelUI-menu-button") != null;
  },


  initSendTabs: function ()
  {
    this._strBundle = document.getElementById("ae-sendtabs-strings");

    var appName = this._strBundle.getString("appName");
    this.aeUtils.log(this.aeString.format("%s initialized; host OS is %s; host app: %s (version %s)", appName, this.aeUtils.getOS(), this.aeUtils.getHostAppName(), this.aeUtils.getHostAppVersion()));

    // Tab menu initialization
    var tabMenuElt = document.getElementById("alltabs-popup");
    if (tabMenuElt) {
      let that = window.aecreations.sendtaburls;
      tabMenuElt.addEventListener("popupshowing", that.initTabMenuCmd, false);
    }

    // Migrate prefs from root to the "extensions." branch
    let migratePrefs = this.aeUtils.getPref("sendtabs.migrate_prefs", true);
    if (migratePrefs) {
      this.aePrefMigrator.migratePrefs();
      this.aeUtils.setPref("sendtabs.migrate_prefs", false);
    }

    let firstRun = this.aeUtils.getPref("sendtabs.first_run", true);
    if (firstRun) {
      if (this.isAustralisUI()) {
	// Add the Send Tab URLs button to Firefox's menu panel.
	CustomizableUI.addWidgetToArea("ae-sendtabs-toolbarbutton", CustomizableUI.AREA_PANEL);
      }

      this.aeUtils.setPref("sendtabs.first_run", false);
    }
  },

  
  initTabMenuCmd: function (aEvent)
  {
    var isTabMenuCmdVisible = this.aeUtils.getPref("sendtabs.show_tab_menu_command", true);
    if (! isTabMenuCmdVisible) {
      document.getElementById("ae-sendtabs-tabmenu").hidden = true;
    }
  },
    

  sendTabs: function ()
  { 
    var isFormatPromptEnabled = this.aeUtils.getPref("sendtabs.message.format.always_ask", true);
    if (isFormatPromptEnabled) {
      var dlgArgs = { cancel: null };
      window.openDialog("chrome://sendtabs/content/formatOpts.xul", "ae_sendtabs_formatopts", "modal,centerscreen", dlgArgs);
      if (dlgArgs.cancel) {
	return;
      }
    }

    var br = this.aeUtils.getPref("sendtabs.message.line_break", "\r\n");
    var mailDest = this.aeUtils.getPref("sendtabs.mailclient", 0);
    var tabbrowser = document.getElementById("content");
    var numTabs = tabbrowser.browsers.length;
    var maxTabs = mailDest == this.SENDTO_CLIPBOARD ? numTabs : 30;
    var webmailClient;

    switch (mailDest) {
    case this.SENDTO_GMAIL:
      webmailClient = this._strBundle.getString("gmail");

      // A "Bad Request" error will occur in Gmail if the URL list uses "\r\n"
      // (URI encoding "%0D%0A") as the line break character.
      br = "\n";
      break;

    case this.SENDTO_GOOGLEAPPS:
      webmailClient = this._strBundle.getString("googleApps");
      br = "\n";
      break;

    default:
      break;
    }

    var body = "";
    var listStyle = this.aeUtils.getPref("sendtabs.message.format.list_style", 0);
    var listChar = "";

    if (listStyle == this.FMTOPT_BULLETED) {
      listChar = "- ";
    }

    for (let i = 0; i < numTabs && i < maxTabs; i++) {
      if (listStyle == this.FMTOPT_NUMBERED) {
	listChar = i + 1 + ". ";
      }

      var title = "";
      title = tabbrowser.browsers[i].contentDocument.title;

      if (title == "") {
	// The web page title in the browser tab may not be retrievable if the
	// tab wasn't loaded.
	let tabbrowserTabs = document.getElementById("tabbrowser-tabs").tabbrowser.tabs;
	title = tabbrowserTabs[i].label;
      }

      if (title == "") {
	var hdgs = tabbrowser.browsers[i].contentDocument.getElementsByTagName("h1");
	if (hdgs && hdgs.length > 0) {
	  title = hdgs[0].textContent;
	}
	else {
	  title = this._strBundle.getString("untitledPage");
	}
      }

      body += listChar + title + br 
 	    + tabbrowser.browsers[i].currentURI.spec + br + br;
    }

    var totalTabs = numTabs > maxTabs ? maxTabs : numTabs;
    var subj;

    if (totalTabs == 1) {
      subj = this._strBundle.getFormattedString("subjectLineSingular", [totalTabs]);
    }
    else {
      subj = this._strBundle.getFormattedString("subjectLine", [totalTabs]);
    }

    // Gmail/Google Apps won't accept long mail URLs; an error occurs when the
    // the user attempts to log in if a long URL is sent to Gmail.
    // If the URL list is too long, give the user the option to copy it to the
    // clipboard.  Then open Gmail, let the user log in if not already logged
    // in, and display the message compose screen where the user can paste the 
    // URL list.
    var draftMsg = subj + body;
    var isGoogleMailClient = (mailDest == this.SENDTO_GMAIL || mailDest == this.SENDTO_GOOGLEAPPS);
    var launchGmailAfterCopy, googleMailDest;

    this.aeUtils.log("Length of message: " + draftMsg.length + "\nGmail max message length: " + this.GMAIL_MAX_MSGLEN);

    if (isGoogleMailClient && draftMsg.length > this.GMAIL_MAX_MSGLEN) {
      var dlgArgs = { webmailClientName: webmailClient, userCancel: null };
      window.openDialog("chrome://sendtabs/content/longURLList.xul", "dlg_sendtabs_lengthwarn", "chrome,modal,centerscreen", dlgArgs);
      if (dlgArgs.userCancel) {
	return;
      }

      launchGmailAfterCopy = dlgArgs.autoLaunchGmail;
      googleMailDest = mailDest;
      mailDest = this.SENDTO_CLIPBOARD;
    }
    
    var mailStr;  
    var newTab;

    switch (mailDest) {
    case this.SENDTO_CLIPBOARD:  // Clipboard
      var urlCountPos = this.aeUtils.getPref("sendtabs.mailclient.clipboard.url_count_position", 1);
      if (urlCountPos == this.CLIPBOARD_URLCOUNT_TOP) {
	mailStr = subj + br + br + br + body;
      }
      else if (urlCountPos == this.CLIPBOARD_URLCOUNT_BOTTOM) {
	mailStr = body + br + subj + br;
      }
      else {
	mailStr = body;
      }

      var clipbd = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
	                     .getService(Components.interfaces
					 .nsIClipboardHelper);
      clipbd.copyString(mailStr);

      var confirmCopy = this.aeUtils.getPref("sendtabs.mailclient.clipboard.confirm_copy", true);
      if (confirmCopy) {
	this._showCopyToClipboardConfirmation();
      }

      if (launchGmailAfterCopy) {
	if (googleMailDest == this.SENDTO_GMAIL) {
	  mailStr = "https://mail.google.com/mail/?ui=2&view=cm&cmid=0&fs=1&tearoff=1";
	}
	else if (googleMailDest == this.SENDTO_GOOGLEAPPS) {
	  mailStr = this._getGoogleAppsMailStr();
	}
	if (mailStr) {
	  this._loadWebMailClient(mailStr);
	}
      }

      return;

    case this.SENDTO_GMAIL:  // Gmail
      mailStr = "https://mail.google.com/mail/?ui=2&view=cm&cmid=0&fs=1&tearoff=1&to=&su=" 
	        + encodeURIComponent(subj) + "&body="
	        + encodeURIComponent(body);
      this.aeUtils.log("Gmail compose URL:\n\n" + mailStr);
      this._loadWebMailClient(mailStr);
      return;
      
    case this.SENDTO_GOOGLEAPPS:
      mailStr = this._getGoogleAppsMailStr(subj, body);
      if (mailStr) {
	this.aeUtils.log("Google Apps Gmail compose URL:\n\n" + mailStr);
	this._loadWebMailClient(mailStr);
      }
      return;

    default:
      break;
    }

    // Workaround to "mailto" URL length constraint (~462 chars) on Windows.
    // Execute supported apps (Thunderbird, SeaMonkey, Outlook Express, etc.)
    // with command line parameters to create email message.
    // All other email clients: just pass the "mailto" URL, taking a risk at
    // not being able to start the default email client at all.
    if (this.aeUtils.getOS() == "WINNT") {
      try {
	var result = this._winExecEmailApp(subj, body);
      }
      catch (e) {
	var msg = this._strBundle.getString("errAppExecError");
	msg += (this.aeUtils.DEBUG ? "\n\n".concat(e) : "");
	this.aeUtils.alertEx(this._strBundle.getString("appName"), msg);
	return;
      }

      if (! result) {
	this.aeUtils.log(this._strBundle.getString("appName") + " cannot find a supported email app; will attempt to launch 'mailto:' URL");
	this._execMailtoURL(subj, body);
      }
    }
    else {
      this._execMailtoURL(subj, body);
    }
  },


  _showCopyToClipboardConfirmation: function ()
  {
    // Display confirmation as an alert, if available.
    try {
      var alertSvc = Components.classes["@mozilla.org/alerts-service;1"]
                               .getService(Components.interfaces.nsIAlertsService);

      alertSvc.showAlertNotification(
        "chrome://sendtabs/skin/img/message-icon.png",
	this._strBundle.getString("appName"),
	this._strBundle.getString("sendToClipboardConfirm"),
	false,
	"",
	null,
	this._strBundle.getString("appName")
      );
    }
    catch (e) {
      window.openDialog("chrome://sendtabs/content/copyToClipboard.xul",
  		        "dlg_sendtabs_copytoclpbd", "chrome,modal,centerscreen");
    }
  },


  _getGoogleAppsMailStr: function (aSubject, aBody)
  {
    var rv;
    var gappsDomain = this.aeUtils.getPref("sendtabs.mailclient.googleapps.domain", "");
    if (! gappsDomain) {
      var dlgArgs = {};
      window.openDialog("chrome://sendtabs/content/googleApps.xul",
			"dlg_sendtabs_googapps",
			"chrome,modal,centerscreen", dlgArgs);

      if ('googleAppsDomain' in dlgArgs) {
	gappsDomain = dlgArgs.googleAppsDomain;
	this.aeUtils.log("sendtabs: Google Apps domain name: " + gappsDomain);
	this.aeUtils.setPref("sendtabs.mailclient.googleapps.domain",
			    gappsDomain);
      }
      else {
	this.aeUtils.log("sendtabs: Google Apps domain name was not set.");
	return rv;
      }
    }

    rv = "https://mail.google.com/a/" + gappsDomain
         + "/?ui=2&view=cm&cmid=0&fs=1&tearoff=1&to=&su=";
    
    if (arguments.length > 0) {
      rv += encodeURIComponent(aSubject) + "&body=" + encodeURIComponent(aBody);
    }

    return rv;
  },


  _loadWebMailClient: function (aMailStr)
  {
    var openInNewWnd = this.aeUtils.getPref("sendtabs.webmail.open_in_new_window", false);
    if (openInNewWnd) {
      var wndFeatures = this.aeUtils.getPref("sendtabs.webmail.window_features", "");
      window.open(aMailStr, null, wndFeatures);
    }
    else {
      var newTab = gBrowser.loadOneTab(aMailStr);
      gBrowser.selectedTab = newTab;
    }
  },


  /*
   * Throws exception if app execution failed, otherwise returns true if email
   * app successfully executed, false if a supported email app wasn't found.
   */
  _winExecEmailApp: function (aSubject, aBody)
  {
    var rv = false;
    var cmdLine = this._getWindowsDefaultEmailAppCmdLine();
    if (! cmdLine) {
      return rv;
    }

    cmdLine = this._sanitizeCmdLineStr(cmdLine);
    cmdLine = this._winSubstCmdLineVars(cmdLine);
    cmdLine = cmdLine.substring(0, (cmdLine.toLowerCase().indexOf(".exe") + 4));
    this.aeUtils.log("Command line of default email app:\n\"" + cmdLine + "\"");
    
    var subj = encodeURIComponent(aSubject);
    var body = encodeURIComponent(aBody);
    var mailto = "mailto:?subject=" + subj + "&body=" + body;
    var mailApp = this.aeWindowsApp.createInstance();
    mailApp.setPath(cmdLine);

    // Check for supported email apps
    // Thunderbird, Seamonkey, Mozilla suite, or Netscape 7
    if (cmdLine.search(/thunde(rbird)?/i)  != -1
	|| cmdLine.search(/seamon(key)?/i) != -1
	|| cmdLine.search(/mozilla\.exe/i) != -1  // Mozilla 1.x suite
	|| cmdLine.search(/netscp\.exe/i)  != -1  // Netscape 7
	// NOTE: Netscape versions older than v.7 are not supported
	) {

      mailApp.setArgs("-compose", "to=,subject=" + subj + ",body=" + body);
    }
    // Outlook Express, Windows Mail or Windows Live Mail
    else if (cmdLine.search(/msimn\.exe/i) != -1
	     || cmdLine.search(/winmail\.exe/i) != -1
	     || cmdLine.search(/wlmail\.exe/i)  != -1) {
      mailApp.setArgs("/mailurl:" + mailto);
    }
    // MS Office Outlook
    else if (cmdLine.search(/outlook\.exe/i) != -1) {
      mailApp.setArgs("/c", "ipm.note", "/m", mailto);
    }
    // Eudora
    else if (cmdLine.search(/eudora\.exe/i) != -1) {
      var eudoraPath = cmdLine.substring(0, cmdLine.lastIndexOf("\\"));
      var eudoraDir = Components.classes["@mozilla.org/file/local;1"]
                                .createInstance(Components.interfaces.nsILocalFile);
      eudoraDir.initWithPath(eudoraPath);
      this.aeUtils.log("sendtabs: Path to Eudora program folder: \"" + eudoraDir.path + "\"");

      // Both classic Eudora and Eudora 8 have the same executable file name,
      // but only Eudora 8 has xpcom.dll in its program folder.
      var isEudora8 = false;
      var dirEntries = eudoraDir.directoryEntries;
      while (dirEntries.hasMoreElements()) {
	var dirEntry = dirEntries.getNext();
	dirEntry.QueryInterface(Components.interfaces.nsIFile);
	if (dirEntry.isFile() && dirEntry.leafName == "xpcom.dll") {
	  this.aeUtils.log("sendtabs: Eudora 8 detected as the default email application");
	  isEudora8 = true;
	  break;
	}
      }

      if (isEudora8) {
	mailApp.setArgs("-compose", "to=,subject=" + subj + ",body=" + body);
      }
      else {
	// Classic Eudora won't take long mailto: URLs. Eudora main window will
	// open, but no compose window will appear.
	this.aeUtils.log("sendtabs: Eudora 7 or older detected; successful launch of 'mailto:' URL is not guaranteed");
	return rv;
      }
    }
    else {
      return rv;
    }

    try {
      mailApp.exec();
    }
    catch (e) {
      throw e;
    }
    rv = true;

    return rv;
  },

  
  _getWindowsDefaultEmailAppCmdLine: function () 
  {
    var rv, cmdLine;
    var wrk = Components.classes["@mozilla.org/windows-registry-key;1"]
	                .createInstance(Components.interfaces.nsIWindowsRegKey);
    // Determine default mail app from Windows registry
    try {
      wrk.open(wrk.ROOT_KEY_CLASSES_ROOT, "mailto\\shell\\open\\command",
	       wrk.ACCESS_READ);
      cmdLine = wrk.readStringValue("");  // Get default value
    }
    catch (e) {
      // Reach here if the above registry key wasn't defined
      this.aeUtils.log(e);
    }
    finally {
      wrk.close();
    }

    rv = cmdLine;
    return rv;
  },


  _execMailtoURL: function (aSubject, aBody)
  {
    var uri;
    var mailtoURL = "mailto:?subject=" + encodeURIComponent(aSubject) + "&body=" + encodeURIComponent(aBody);
    this.aeUtils.log("Length of mailto URL: " + mailtoURL.length + " chars");

    var ioSvc = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);

    uri = ioSvc.newURI(mailtoURL, null, null);

    var eps = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"].getService(Components.interfaces.nsIExternalProtocolService);

    try {
      // !!! BUG !!!
      // Windows won't accept mailto: URLs longer than ~462 char's
      eps.loadUrl(uri);
    } 
    catch (e) { 
      this.aeUtils.alertEx(this._strBundle.getString("appName"),
			  this._strBundle.getString("errAppExecError"));
      this.aeUtils.log(e); 
    }
  },


  /*
   * Removes quotation marks from the given string.
   */
  _sanitizeCmdLineStr: function (aString)
  {
    return aString.replace(/\"/g, "");
  },


  /*
   * Substitues the following Windows environment variables with actual paths:
   * %ProgramFiles%, %windir%, %systemroot%
   * (capitalization of environment variables do not matter)
   */
  _winSubstCmdLineVars: function (aString)
  {
    var dirProp = Components.classes["@mozilla.org/file/directory_service;1"]
                            .getService(Components.interfaces.nsIProperties);
    var progFiles = dirProp.get("ProgF", Components.interfaces.nsIFile);
    var winDir = dirProp.get("WinD", Components.interfaces.nsIFile);

    var str = aString.replace(/\%ProgramFiles\%/i, progFiles.path);
    str = str.replace(/(\%windir\%)|(\%systemroot\%)/i, winDir.path);

    return str;
  }
};


//
// JavaScript modules
//

Components.utils.import("resource://sendtabs/modules/aeUtils.js",
			window.aecreations.sendtaburls);
Components.utils.import("resource://sendtabs/modules/aeString.js",
			window.aecreations.sendtaburls);
Components.utils.import("resource://sendtabs/modules/aeWindowsApp.js",
			window.aecreations.sendtaburls);
Components.utils.import("resource://sendtabs/modules/aePrefMigrator.js",
			window.aecreations.sendtaburls);


//
// Event handler initialization
//

window.addEventListener("load",   window.aecreations.sendtaburls, false);
window.addEventListener("unload", window.aecreations.sendtaburls, false);
