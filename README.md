# Formfill Teletalk

A Chrome Manifest V3 extension for keeping a reusable application profile and filling matching fields on forms in English and Bangla.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this project folder.
4. The profile setup page opens on first install. Enter details and choose **Save profile**.
5. Turn on **Autofill** in the page or extension popup. Chrome will ask you to allow access to websites so the extension can recognize forms.

When enabled, a small prompt appears if matching fields are found. Choose **Review & fill**, uncheck anything you want to skip, and fill the selected fields. When disabled, the extension does not scan page fields and closes its prompt.

## Privacy

Profile data is stored in Chrome's local extension storage on this device. The extension does not send the profile to a server. Autofill is off by default. Enabling it requests website access; you can turn it off at any time in the popup or profile page.

## Current scope

The profile includes personal information, separate ID availability and ID number fields, present and permanent addresses, education with separate result type and score, and job experience. Quota and departmental status choices reflect the supplied application form. Field matching uses common English and Bangla labels, input names, IDs, and placeholders. Dropdowns are filled when the saved value matches an available option. Some sites use custom controls or unusual labels that may need more matching rules.
