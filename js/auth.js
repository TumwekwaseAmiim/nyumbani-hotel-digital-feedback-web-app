// =====================================================
// NYUMBANI HOTEL
// REAL SUPABASE STAFF AUTHENTICATION
// =====================================================


// =====================================================
// SELECTED ROLE
// =====================================================

function selectedRole() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlRole =
        params.get("role");

    if (urlRole) {

        sessionStorage.setItem(
            "nyumbani_selected_role",
            urlRole
        );

        return urlRole;
    }


    return (
        sessionStorage.getItem(
            "nyumbani_selected_role"
        ) || "Staff"
    );
}


// =====================================================
// CHECK LOGIN PAGE
// =====================================================

function onLoginPage() {

    return (
        window.location.pathname.endsWith(
            "/login.html"
        ) ||
        window.location.pathname.endsWith(
            "login.html"
        )
    );
}


// =====================================================
// SHOW LOGIN MESSAGE
// =====================================================

function showLoginMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "loginMessage"
        );

    if (!element) return;


    element.textContent =
        message;

    element.className =
        `form-message ${type}`;
}


// =====================================================
// NORMALIZE ROLE
// =====================================================

function normalizeRole(role) {

    if (!role) {
        return "Staff";
    }


    const value =
        String(role)
            .trim()
            .toLowerCase();


    if (
        value === "system admin" ||
        value === "system-admin" ||
        value === "admin"
    ) {

        return "System Admin";
    }


    if (
        value === "manager"
    ) {

        return "Manager";
    }


    if (
        value === "receptionist"
    ) {

        return "Receptionist";
    }


    return "Staff";
}


// =====================================================
// GET CURRENT STAFF PROFILE
// =====================================================

async function getCurrentStaffProfile() {

    try {

        const {
            data,
            error
        } =
            await window.nyumbaniSupabase
                .rpc(
                    "get_my_staff_profile"
                );


        if (error) {

            console.error(
                "Staff profile RPC error:",
                error
            );

            return null;
        }


        if (
            !data ||
            data.length === 0
        ) {

            console.warn(
                "No active staff profile found."
            );

            return null;
        }


        return data[0];

    }

    catch (error) {

        console.error(
            "Staff profile request failed:",
            error
        );

        return null;
    }
}


// =====================================================
// SAVE STAFF SESSION DISPLAY DATA
// =====================================================

function saveStaffDisplayData(profile) {

    sessionStorage.setItem(
        "nyumbani_role",
        profile.role
    );

    sessionStorage.setItem(
        "nyumbani_staff_name",
        profile.full_name || ""
    );

    sessionStorage.setItem(
        "nyumbani_email",
        profile.email || ""
    );
}


// =====================================================
// CLEAR LOCAL DISPLAY SESSION
// =====================================================

function clearStaffDisplayData() {

    sessionStorage.removeItem(
        "nyumbani_role"
    );

    sessionStorage.removeItem(
        "nyumbani_staff_name"
    );

    sessionStorage.removeItem(
        "nyumbani_email"
    );
}


// =====================================================
// LOGIN SETUP
// =====================================================

async function setupLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {
        return;
    }


    const requestedRole =
        normalizeRole(
            selectedRole()
        );


    sessionStorage.setItem(
        "nyumbani_selected_role",
        requestedRole
    );


    const roleText =
        document.getElementById(
            "roleText"
        );


    const loginTitle =
        document.getElementById(
            "loginTitle"
        );


    if (roleText) {

        roleText.textContent =
            requestedRole;
    }


    if (loginTitle) {

        loginTitle.textContent =
            requestedRole === "Staff"
                ? "Staff Login"
                : `${requestedRole} Login`;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailElement =
                document.getElementById(
                    "loginEmail"
                );


            const passwordElement =
                document.getElementById(
                    "loginPassword"
                );


            const email =
                emailElement
                    ? emailElement.value.trim()
                    : "";


            const password =
                passwordElement
                    ? passwordElement.value
                    : "";


            if (
                !email ||
                !password
            ) {

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;
            }


            showLoginMessage(
                "Signing in...",
                "success"
            );


            try {

                // ==========================================
                // SIGN IN
                // ==========================================

                const {
                    data: authData,
                    error: authError
                } =
                    await window
                        .nyumbaniSupabase
                        .auth
                        .signInWithPassword({
                            email,
                            password
                        });


                if (authError) {

                    console.error(
                        "Login error:",
                        authError
                    );


                    showLoginMessage(
                        "Incorrect email or password."
                    );

                    return;
                }


                if (
                    !authData ||
                    !authData.user
                ) {

                    showLoginMessage(
                        "Login could not be completed."
                    );

                    return;
                }


                console.log(
                    "Authenticated user:",
                    authData.user.id,
                    authData.user.email
                );


                // ==========================================
                // GET REAL STAFF PROFILE
                // ==========================================

                const profile =
                    await getCurrentStaffProfile();


                if (!profile) {

                    console.warn(
                        "Authenticated user has no active Nyumbani staff profile."
                    );


                    await window
                        .nyumbaniSupabase
                        .auth
                        .signOut();


                    clearStaffDisplayData();


                    showLoginMessage(
                        "This account is not registered as an active Nyumbani Hotel staff member."
                    );

                    return;
                }


                console.log(
                    "Staff profile:",
                    profile
                );


                // ==========================================
                // REAL DATABASE ROLE
                // ==========================================

                const realRole =
                    normalizeRole(
                        profile.role
                    );


                const chosenRole =
                    normalizeRole(
                        requestedRole
                    );


                // ==========================================
                // CHECK ROLE
                // ==========================================

                if (
                    chosenRole !== "Staff" &&
                    chosenRole !== realRole
                ) {

                    await window
                        .nyumbaniSupabase
                        .auth
                        .signOut();


                    clearStaffDisplayData();


                    showLoginMessage(
                        `This account is registered as ${realRole}, not ${chosenRole}.`
                    );

                    return;
                }


                // ==========================================
                // STORE DISPLAY DATA
                // ==========================================

                profile.role =
                    realRole;


                saveStaffDisplayData(
                    profile
                );


                showLoginMessage(
                    "Login successful.",
                    "success"
                );


                // ==========================================
                // DASHBOARD
                // ==========================================

                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );


                showLoginMessage(
                    "Unable to login. Please check your connection and try again."
                );
            }

        }
    );
}


// =====================================================
// REQUIRE LOGIN
// =====================================================

async function requireLogin() {

    if (
        onLoginPage()
    ) {

        return;
    }


    try {

        // ==============================================
        // GET SUPABASE SESSION
        // ==============================================

        const {
            data,
            error
        } =
            await window
                .nyumbaniSupabase
                .auth
                .getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );


            clearStaffDisplayData();


            window.location.href =
                "login.html";

            return;
        }


        const session =
            data
                ? data.session
                : null;


        if (!session) {

            clearStaffDisplayData();


            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Current authenticated user:",
            session.user.id,
            session.user.email
        );


        // ==============================================
        // GET STAFF PROFILE
        // ==============================================

        const profile =
            await getCurrentStaffProfile();


        if (!profile) {

            console.warn(
                "No active staff profile available for this session."
            );


            await window
                .nyumbaniSupabase
                .auth
                .signOut();


            clearStaffDisplayData();


            window.location.href =
                "login.html";

            return;
        }


        profile.role =
            normalizeRole(
                profile.role
            );


        saveStaffDisplayData(
            profile
        );


        const role =
            profile.role;


        // ==============================================
        // DISPLAY STAFF + ROLE
        // ==============================================

        const roleHeader =
            document.getElementById(
                "roleHeader"
            );


        if (roleHeader) {

            if (
                profile.full_name
            ) {

                roleHeader.textContent =
                    `${profile.full_name} — ${role}`;

            }

            else {

                roleHeader.textContent =
                    role;
            }
        }


        // ==============================================
        // SYSTEM ADMIN LINKS
        // ==============================================

        document
            .querySelectorAll(
                ".admin-only"
            )
            .forEach(
                function (element) {

                    if (
                        role !==
                        "System Admin"
                    ) {

                        element.style.display =
                            "none";

                    }

                    else {

                        element.style.display =
                            "";
                    }
                }
            );


        // ==============================================
        // PROTECTED ADMIN PAGES
        // ==============================================

        const path =
            window.location.pathname;


        const adminOnlyPage =
            path.endsWith(
                "/staff.html"
            ) ||
            path.endsWith(
                "/settings.html"
            );


        if (
            adminOnlyPage &&
            role !== "System Admin"
        ) {

            window.location.href =
                "dashboard.html";

            return;
        }

    }

    catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );


        clearStaffDisplayData();


        window.location.href =
            "login.html";
    }
}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    const button =
        document.getElementById(
            "logoutBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            try {

                await window
                    .nyumbaniSupabase
                    .auth
                    .signOut();

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }


            clearStaffDisplayData();


            sessionStorage.removeItem(
                "nyumbani_selected_role"
            );


            window.location.href =
                "../index.html";
        }
    );
}


// =====================================================
// STAFF ENROLLMENT PLACEHOLDER
// =====================================================

function setupStaff() {

    const form =
        document.getElementById(
            "staffForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "staffMessage"
                );


            if (message) {

                message.textContent =
                    "Secure online staff enrollment will be connected next.";

                message.className =
                    "form-message";
            }
        }
    );
}


// =====================================================
// AUTH STATE WATCHER
// =====================================================

function watchAuthState() {

    if (
        !window.nyumbaniSupabase
    ) {

        return;
    }


    window
        .nyumbaniSupabase
        .auth
        .onAuthStateChange(
            function (
                event,
                session
            ) {

                console.log(
                    "Nyumbani Auth:",
                    event
                );


                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    clearStaffDisplayData();


                    if (
                        !onLoginPage()
                    ) {

                        window.location.href =
                            "login.html";
                    }
                }

            }
        );
}


// =====================================================
// START SYSTEM
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (
            !window.nyumbaniSupabase
        ) {

            console.error(
                "Supabase client is not loaded."
            );

            return;
        }


        watchAuthState();


        setupLogout();


        setupStaff();


        if (
            onLoginPage()
        ) {

            await setupLogin();

        }

        else {

            await requireLogin();
        }

    }
);