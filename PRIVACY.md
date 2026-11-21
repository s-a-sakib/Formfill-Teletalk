# Privacy Policy for Formfill Teletalk

**Last Updated:** November 21, 2026

Formfill Teletalk ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy describes how your information is handled by the Formfill Teletalk browser extension.

---

### 1. Single Purpose & Data Processing
Formfill Teletalk is designed solely to help users store and autofill recruitment application forms on Teletalk Bangladesh recruitment portals (`*.teletalk.com.bd`, `alljobs.teletalk.com.bd`, etc.).

### 2. 100% Local Storage & Zero External Transmission
* **No Remote Servers:** We do not own, operate, or connect to any external database or analytics server.
* **No Data Collection:** We do not collect, transmit, track, or share any of your personal data, form responses, browsing history, or uploaded images.
* **Local Processing:** All applicant data—including names, contact numbers, National ID (NID) numbers, educational records, photos, and signatures—is stored exclusively on your local computer using the browser's local extension storage.

### 3. Local Encryption & Security
* Stored applicant profiles are protected at rest using authenticated **AES-256-GCM** encryption derived with **PBKDF2** (SHA-256, 100,000 iterations).
* Unlocked session keys are maintained strictly in temporary memory (`chrome.storage.session`) and are purged upon vault lock or browser restart.
* The extension includes an anti-form-jacking engine that prevents invisible or off-screen decoy input fields from accessing your data.

### 4. Third-Party Sharing & Selling
* We **never** sell, rent, trade, or transfer any user data to third parties.
* We **never** use user data for advertising, marketing, profiling, creditworthiness assessment, or lending purposes.

### 5. Permissions Used
* **`storage` & `unlimitedStorage`:** To save your candidate profiles and resized photos/signatures locally on your device.
* **`alarms`:** To trigger the automatic lock timer after a period of user inactivity.
* **`activeTab` & `scripting`:** To detect form fields and populate candidate data only on the page you are currently viewing when autofill is active.

### 6. User Control & Data Deletion
You maintain complete control over your data:
* You can add, edit, or delete any profile at any time in the extension options.
* You can reset and permanently erase all stored data by choosing "Reset Vault" in the Settings panel or by uninstalling the extension.

### 7. Contact
If you have any questions or feedback regarding this Privacy Policy, please open an issue on the official GitHub repository:
https://github.com/s-a-sakib/Formfill-Teletalk
