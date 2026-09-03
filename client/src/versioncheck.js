const CHECK_INTERVAL = 60 * 1000; // 1 minute

let currentVersion = null;

async function checkVersion() {
    try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
            cache: "no-store",
        });

        const data = await response.json();

        if (currentVersion === null) {
            currentVersion = data.version;
            return;
        }

        if (data.version !== currentVersion) {
            console.log("New version detected. Reloading...");
            window.location.reload();
        }
    } catch (error) {
        console.error("Version check failed:", error);
    }
}

checkVersion();
setInterval(checkVersion, CHECK_INTERVAL);
