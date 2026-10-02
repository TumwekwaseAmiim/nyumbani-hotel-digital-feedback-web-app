// =====================================================
// NYUMBANI HOTEL
// CHANGE PASSWORD SYSTEM
// js/change-password.js
// =====================================================


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Nyumbani change-password.js loaded."
        );


        // =================================================
        // ELEMENTS
        // =================================================

        const form =
            document.getElementById(
                "changePasswordForm"
            );


        const currentPasswordInput =
            document.getElementById(
                "currentPassword"
            );


        const newPasswordInput =
            document.getElementById(
                "newPassword"
            );


        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );


        const message =
            document.getElementById(
                "passwordMessage"
            );


        const button =
            document.getElementById(
                "changePasswordBtn"
            );


        const emailDisplay =
            document.getElementById(
                "currentUserEmail"
            );


        const lengthCheck =
            document.getElementById(
                "lengthCheck"
            );


        const uppercaseCheck =
            document.getElementById(
                "uppercaseCheck"
            );


        const lowercaseCheck =
            document.getElementById(
                "lowercaseCheck"
            );


        const numberCheck =
            document.getElementById(
                "numberCheck"
            );


        const matchCheck =
            document.getElementById(
                "matchCheck"
            );


        // =================================================
        // CHECK SUPABASE
        // =================================================

        if (
            !window.nyumbaniSupabase
        ) {

            console.error(
                "Supabase client not available."
            );


            if (message) {

                message.textContent =
                    "Database connection unavailable.";

                message.className =
                    "form-message error";

            }


            return;

        }


        // =================================================
        // LOAD CURRENT USER
        // =================================================

        let currentUser =
            null;


        try {

            const {
                data,
                error
            } =
                await window
                    .nyumbaniSupabase
                    .auth
                    .getUser();


            if (error) {

                console.error(
                    "Unable to get current user:",
                    error
                );


                throw error;

            }


            currentUser =
                data?.user || null;


            if (
                !currentUser
            ) {

                console.warn(
                    "No authenticated user found."
                );


                if (message) {

                    message.textContent =
                        "Your login session has expired. Please log in again.";

                    message.className =
                        "form-message error";

                }


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );


                return;

            }


            console.log(
                "Authenticated user:",
                currentUser.email
            );


            if (
                emailDisplay
            ) {

                emailDisplay.textContent =
                    currentUser.email ||
                    "Staff Account";

            }


        } catch (
            error
        ) {

            console.error(
                "User session check failed:",
                error
            );


            if (message) {

                message.textContent =
                    "Unable to verify your account.";

                message.className =
                    "form-message error";

            }


            return;

        }


        // =================================================
        // PASSWORD VALIDATION HELPERS
        // =================================================

        function hasMinimumLength(
            password
        ) {

            return password.length >= 8;

        }


        function hasUppercase(
            password
        ) {

            return /[A-Z]/.test(
                password
            );

        }


        function hasLowercase(
            password
        ) {

            return /[a-z]/.test(
                password
            );

        }


        function hasNumber(
            password
        ) {

            return /[0-9]/.test(
                password
            );

        }


        function passwordsMatch() {

            return (

                newPasswordInput.value !== "" &&

                newPasswordInput.value ===
                confirmPasswordInput.value

            );

        }


        // =================================================
        // UPDATE REQUIREMENT DISPLAY
        // =================================================

        function updateCheck(
            element,
            passed
        ) {

            if (!element) {

                return;

            }


            if (passed) {

                element.style.color =
                    "#1f7a45";

                element.textContent =
                    "✓ " +
                    element.textContent
                        .replace(
                            /^✓\s*/,
                            ""
                        )
                        .replace(
                            /^✕\s*/,
                            ""
                        );

            } else {

                element.style.color =
                    "#a32121";

                element.textContent =
                    "✕ " +
                    element.textContent
                        .replace(
                            /^✓\s*/,
                            ""
                        )
                        .replace(
                            /^✕\s*/,
                            ""
                        );

            }

        }


        function validatePasswordLive() {

            const password =
                newPasswordInput.value;


            updateCheck(
                lengthCheck,
                hasMinimumLength(
                    password
                )
            );


            updateCheck(
                uppercaseCheck,
                hasUppercase(
                    password
                )
            );


            updateCheck(
                lowercaseCheck,
                hasLowercase(
                    password
                )
            );


            updateCheck(
                numberCheck,
                hasNumber(
                    password
                )
            );


            updateCheck(
                matchCheck,
                passwordsMatch()
            );

        }


        // =================================================
        // LIVE VALIDATION
        // =================================================

        if (
            newPasswordInput
        ) {

            newPasswordInput
                .addEventListener(
                    "input",
                    validatePasswordLive
                );

        }


        if (
            confirmPasswordInput
        ) {

            confirmPasswordInput
                .addEventListener(
                    "input",
                    validatePasswordLive
                );

        }


        // =================================================
        // BUTTON STATE
        // =================================================

        function setLoading(
            loading
        ) {

            if (!button) {

                return;

            }


            button.disabled =
                loading;


            button.textContent =
                loading
                    ? "Changing Password..."
                    : "Change Password";

        }


        // =================================================
        // CLEAR MESSAGE
        // =================================================

        function clearMessage() {

            if (!message) {

                return;

            }


            message.textContent =
                "";

            message.className =
                "form-message";

        }


        // =================================================
        // FORM SUBMIT
        // =================================================

        if (
            !form
        ) {

            console.error(
                "Change password form not found."
            );

            return;

        }


        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                clearMessage();


                const currentPassword =
                    currentPasswordInput
                        .value
                        .trim();


                const newPassword =
                    newPasswordInput
                        .value;


                const confirmPassword =
                    confirmPasswordInput
                        .value;


                // =================================================
                // BASIC VALIDATION
                // =================================================

                if (
                    !currentPassword
                ) {

                    message.textContent =
                        "Please enter your current password.";

                    message.className =
                        "form-message error";

                    currentPasswordInput
                        .focus();

                    return;

                }


                if (
                    !newPassword
                ) {

                    message.textContent =
                        "Please enter your new password.";

                    message.className =
                        "form-message error";

                    newPasswordInput
                        .focus();

                    return;

                }


                if (
                    !hasMinimumLength(
                        newPassword
                    )
                ) {

                    message.textContent =
                        "The new password must have at least 8 characters.";

                    message.className =
                        "form-message error";

                    return;

                }


                if (
                    !hasUppercase(
                        newPassword
                    )
                ) {

                    message.textContent =
                        "The new password must contain at least one uppercase letter.";

                    message.className =
                        "form-message error";

                    return;

                }


                if (
                    !hasLowercase(
                        newPassword
                    )
                ) {

                    message.textContent =
                        "The new password must contain at least one lowercase letter.";

                    message.className =
                        "form-message error";

                    return;

                }


                if (
                    !hasNumber(
                        newPassword
                    )
                ) {

                    message.textContent =
                        "The new password must contain at least one number.";

                    message.className =
                        "form-message error";

                    return;

                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    message.textContent =
                        "The new passwords do not match.";

                    message.className =
                        "form-message error";

                    confirmPasswordInput
                        .focus();

                    return;

                }


                if (
                    currentPassword ===
                    newPassword
                ) {

                    message.textContent =
                        "Your new password must be different from your current password.";

                    message.className =
                        "form-message error";

                    return;

                }


                // =================================================
                // START
                // =================================================

                setLoading(
                    true
                );


                message.textContent =
                    "Verifying your current password...";

                message.className =
                    "form-message";


                try {

                    // =================================================
                    // VERIFY CURRENT PASSWORD
                    // =================================================

                    const {
                        data:
                            signInData,

                        error:
                            signInError

                    } =
                        await window
                            .nyumbaniSupabase
                            .auth
                            .signInWithPassword({

                                email:
                                    currentUser.email,

                                password:
                                    currentPassword

                            });


                    if (
                        signInError
                    ) {

                        console.error(
                            "Current password verification failed:",
                            signInError
                        );


                        message.textContent =
                            "Your current password is incorrect.";

                        message.className =
                            "form-message error";


                        setLoading(
                            false
                        );


                        currentPasswordInput
                            .focus();


                        return;

                    }


                    if (
                        !signInData
                            ?.user
                    ) {

                        throw new Error(
                            "Unable to verify the current account."
                        );

                    }


                    console.log(
                        "Current password verified successfully."
                    );


                    // =================================================
                    // CHANGE PASSWORD
                    // =================================================

                    message.textContent =
                        "Updating your password...";


                    const {
                        data:
                            updateData,

                        error:
                            updateError

                    } =
                        await window
                            .nyumbaniSupabase
                            .auth
                            .updateUser({

                                password:
                                    newPassword

                            });


                    if (
                        updateError
                    ) {

                        console.error(
                            "Password update error:",
                            updateError
                        );


                        throw updateError;

                    }


                    console.log(
                        "Password updated successfully:",
                        updateData?.user
                            ?.email
                    );


                    // =================================================
                    // SUCCESS
                    // =================================================

                    message.textContent =
                        "Password changed successfully.";

                    message.className =
                        "form-message success";


                    form.reset();


                    validatePasswordLive();


                    setLoading(
                        false
                    );


                    // =================================================
                    // OPTIONAL REDIRECT
                    // =================================================

                    setTimeout(
                        () => {

                            window.location.href =
                                "dashboard.html";

                        },
                        1500
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "========================================"
                    );

                    console.error(
                        "CHANGE PASSWORD ERROR"
                    );

                    console.error(
                        "Message:",
                        error?.message
                    );

                    console.error(
                        "Code:",
                        error?.code
                    );

                    console.error(
                        "Full error:",
                        error
                    );

                    console.error(
                        "========================================"
                    );


                    message.textContent =
                        error?.message
                            ? "Password change failed: " +
                              error.message

                            : "Password change failed. Please try again.";


                    message.className =
                        "form-message error";


                    setLoading(
                        false
                    );

                }

            }
        );


        // =================================================
        // INITIAL VALIDATION DISPLAY
        // =================================================

        validatePasswordLive();

    }
);