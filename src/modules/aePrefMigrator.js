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
 * Portions created by the Initial Developer are Copyright (C) 2013-2014
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

//
// Extension Preferences Migrator Module
//  - Migrates existing, user-set extension prefs from the root branch to the
//    "extensions.aecreations" branch.
//

Components.utils.import("resource://sendtabs/modules/aeUtils.js");
Components.utils.import("resource://gre/modules/Services.jsm");


const EXPORTED_SYMBOLS = ["aePrefMigrator"];

const PREFNAME_PREFIX = "extensions.aecreations.";

const Cc = Components.classes;
const Ci = Components.interfaces;

var Application = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);


var aePrefMigrator = {

  migratePrefs: function () 
  {
    this._migratePref("sendtabs.message.format.list_style", 0);
    this._migratePref("sendtabs.message.format.always_ask", true);
    this._migratePref("sendtabs.mailclient", 0);
    this._migratePref("sendtabs.mailclient.googleapps.enabled", false);
    this._migratePref("sendtabs.mailclient.googleapps.domain", "");
    this._migratePref("sendtabs.mailclient.clipboard.url_count_position", 1);
    this._migratePref("sendtabs.mailclient.clipboard.confirm_copy", true);
    this._migratePref("sendtabs.webmail.open_in_new_window", false);
    this._migratePref("sendtabs.webmail.window_features", "");
    this._migratePref("sendtabs.show_tab_menu_command", true);
    this._migratePref("sendtabs.reload_pending_tabs", true);
  },


  _migratePref: function (aPrefName, aDefaultValue)
  {
    if (! Application.prefs.has(aPrefName)) {
      return;
    }

    // Migrate pref over to "extensions." branch
    let prefValue = Application.prefs.getValue(aPrefName, aDefaultValue);
    let newPrefName = PREFNAME_PREFIX + aPrefName;
    Application.prefs.setValue(newPrefName, prefValue);

    aeUtils.log('aePrefMigrator: Migrated pref: "' + aPrefName + '"');

    let prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    try {
      prefs.clearUserPref(aPrefName);
    }
    catch (e) {
      aeUtils.log("aePrefMigrator: " + e);
    }
  }
};
