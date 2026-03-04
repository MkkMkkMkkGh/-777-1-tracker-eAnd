1. create a basic react app and run it on the emulator
2. send notifications from etisalat(from outside the emulator)  
    Find your emulator's port (usually 5554, shown in the top window bar).  
    Run: telnet localhost 5554  
    Run: sms send Etisalat your pay-as-you plan is active
3. create an app that can read said notification
4. pattern match the message to trigger an action on the app