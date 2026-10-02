// =====================================================
// NYUMBANI HOTEL
// DIGITAL CUSTOMER FEEDBACK SYSTEM
// js/feedback.js
// =====================================================


// =====================================================
// RESIDENT FEEDBACK CATEGORIES
// =====================================================

const residentCategories = [

    "Reception",

    "Check-in Process",

    "General Hygiene",

    "Efficiency of Service",

    "Friendliness of Staff",

    "Room Amenities",

    "Taste / Quality of Meals",

    "Ambience and Comfort"

];


// =====================================================
// NON-RESIDENT FEEDBACK CATEGORIES
// =====================================================

const nonResidentCategories = [

    "Quality of Food",

    "Variety of Food",

    "Presentation of Food",

    "Efficiency of Service",

    "Friendliness of Staff",

    "Venue / Setup",

    "Cleanliness",

    "Ambience",

    "Overall Experience"

];


// =====================================================
// OBJECTIVE SCALE
// =====================================================

const objectiveScale = [

    {
        label: "Very Good",
        score: 5
    },

    {
        label: "Good",
        score: 4
    },

    {
        label: "Average",
        score: 3
    },

    {
        label: "Poor",
        score: 2
    },

    {
        label: "Very Poor",
        score: 1
    }

];


// =====================================================
// STAR GENERATOR
// =====================================================

function stars(score) {

    return "★".repeat(score) +
        "☆".repeat(5 - score);

}


// =====================================================
// CONVERT SCORE TO LABEL
// =====================================================

function scoreLabel(score) {

    const numericScore =
        Number(score);

    const match =
        objectiveScale.find(
            option =>
                option.score === numericScore
        );

    return match
        ? match.label
        : "";

}


// =====================================================
// CREATE QUESTION
// =====================================================

function createQuestion(category) {

    const key = category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");


    return `

        <div
            class="feedback-question"
            data-category="${category}"
            data-key="${key}"
        >

            <strong>
                ${category}
            </strong>


            <div class="objective-options">

                ${objectiveScale.map(option => `

                    <button
                        type="button"
                        class="objective-option"
                        data-score="${option.score}"
                        data-label="${option.label}"
                    >

                        <span class="objective-label">
                            ${option.label}
                        </span>

                        <span class="objective-stars">
                            ${stars(option.score)}
                        </span>

                    </button>

                `).join("")}

            </div>


            <input
                type="hidden"
                name="rating_${key}"
                value=""
            >


            <div
                class="rating-summary"
                id="summary_${key}"
            ></div>


            <div
                class="low-rating-note"
                id="note_${key}"
            >

                Thank you for telling us.

                Please use the comments section to explain
                what went wrong so we can improve.

            </div>

        </div>

    `;

}


// =====================================================
// RENDER QUESTIONS
// =====================================================

function renderQuestions(
    id,
    categories
) {

    const element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    element.innerHTML =
        categories
            .map(createQuestion)
            .join("");

}


// =====================================================
// SMALL FEEDBACK ANIMATION
// =====================================================

function bubble(
    x,
    y,
    symbol
) {

    const bubbleElement =
        document.createElement("span");


    bubbleElement.className =
        "feedback-bubble";


    bubbleElement.textContent =
        symbol;


    bubbleElement.style.left =
        x + "px";


    bubbleElement.style.top =
        y + "px";


    document.body.appendChild(
        bubbleElement
    );


    setTimeout(() => {

        bubbleElement.remove();

    }, 850);

}


// =====================================================
// HANDLE RATING SELECTION
// =====================================================

function handleChoice(event) {

    const button =
        event.target.closest(
            ".objective-option"
        );


    if (!button) {

        return;

    }


    const question =
        button.closest(
            ".feedback-question"
        );


    if (!question) {

        return;

    }


    question
        .querySelectorAll(
            ".objective-option"
        )
        .forEach(option => {

            option.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    const score =
        Number(
            button.dataset.score
        );


    const label =
        button.dataset.label;


    const key =
        question.dataset.key;


    const hiddenInput =
        question.querySelector(
            `input[name="rating_${key}"]`
        );


    if (hiddenInput) {

        hiddenInput.value =
            score;

    }


    const summary =
        document.getElementById(
            "summary_" + key
        );


    if (summary) {

        summary.textContent =
            `${label} — ${stars(score)}`;

    }


    const note =
        document.getElementById(
            "note_" + key
        );


    if (note) {

        note.style.display =
            score <= 2
                ? "block"
                : "none";

    }


    const rectangle =
        button.getBoundingClientRect();


    bubble(

        rectangle.left +
            rectangle.width / 2,

        rectangle.top +
            rectangle.height / 2,

        score >= 4
            ? "✨"
            : score === 3
                ? "•"
                : "✓"

    );

}


// =====================================================
// COLLECT ALL RATINGS
// =====================================================

function collectRatings(form) {

    return [

        ...form.querySelectorAll(
            ".feedback-question"
        )

    ]
        .map(question => {

            const key =
                question.dataset.key;


            const ratingInput =
                question.querySelector(
                    `input[name="rating_${key}"]`
                );


            if (!ratingInput) {

                return null;

            }


            const value =
                ratingInput.value;


            if (!value) {

                return null;

            }


            return {

                category:
                    question.dataset.category,

                rating:
                    Number(value),

                answer:
                    scoreLabel(value)

            };

        })
        .filter(Boolean);

}


// =====================================================
// CALCULATE AVERAGE RATING
// =====================================================

function avg(ratings) {

    if (!ratings.length) {

        return 0;

    }


    const total =
        ratings.reduce(

            (
                sum,
                rating
            ) =>

                sum +
                rating.rating,

            0

        );


    return Number(

        (
            total /
            ratings.length
        ).toFixed(2)

    );

}


// =====================================================
// SET CURRENT DATE AND TIME
// =====================================================

function setDateTime() {

    const element =
        document.getElementById(
            "currentDateTime"
        );


    if (element) {

        element.textContent =
            new Date()
                .toLocaleString();

    }

}


// =====================================================
// SUBMIT BUTTON STATE
// =====================================================

function setSubmitState(
    button,
    loading
) {

    if (!button) {

        return;

    }


    button.disabled =
        loading;


    button.textContent =
        loading
            ? "Submitting Feedback..."
            : "Submit Feedback";

}


// =====================================================
// SUBMIT FEEDBACK
// =====================================================

async function submitFeedback(event) {

    event.preventDefault();


    console.log(
        "========================================"
    );

    console.log(
        "NYUMBANI FEEDBACK SUBMISSION STARTED"
    );

    console.log(
        "========================================"
    );


    const form =
        event.currentTarget;


    const message =
        document.getElementById(
            "formMessage"
        );


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    const guestType =
        form.dataset.guestType;


    console.log(
        "Guest type:",
        guestType
    );


    const data =
        Object.fromEntries(

            new FormData(form)
                .entries()

        );


    console.log(
        "Raw form data:",
        data
    );


    const ratings =
        collectRatings(form);


    console.log(
        "Collected ratings:",
        ratings
    );


    const expected =
        guestType === "Resident"
            ? residentCategories.length
            : nonResidentCategories.length;


    console.log(
        "Expected ratings:",
        expected
    );


    console.log(
        "Received ratings:",
        ratings.length
    );


    // =================================================
    // CHECK ALL OBJECTIVE ANSWERS
    // =================================================

    if (
        ratings.length <
        expected
    ) {

        console.warn(
            "Submission stopped because not all ratings were selected."
        );


        message.textContent =
            "Please select an answer for every category.";


        message.className =
            "form-message error";


        return;

    }


    // =================================================
    // ROOM NUMBER REQUIRED FOR RESIDENT
    // =================================================

    if (
        guestType === "Resident" &&
        !String(
            data.room_number || ""
        ).trim()
    ) {

        console.warn(
            "Resident feedback missing room number."
        );


        message.textContent =
            "Room Number is required for resident feedback.";


        message.className =
            "form-message error";


        return;

    }


    // =================================================
    // NON-RESIDENT PURPOSE REQUIRED
    // =================================================

    if (
        guestType === "Non-Resident" &&
        !data.visit_purpose
    ) {

        console.warn(
            "Non-resident feedback missing visit purpose."
        );


        message.textContent =
            "Please select the purpose of your visit.";


        message.className =
            "form-message error";


        return;

    }


    // =================================================
    // CHECK SUPABASE CLIENT
    // =================================================

    if (
        !window.nyumbaniSupabase
    ) {

        console.error(
            "CRITICAL ERROR: window.nyumbaniSupabase is not available."
        );


        message.textContent =
            "Database connection is unavailable. Please refresh and try again.";


        message.className =
            "form-message error";


        return;

    }


    // =================================================
    // START LOADING
    // =================================================

    setSubmitState(
        submitButton,
        true
    );


    message.textContent =
        "Submitting your feedback...";


    message.className =
        "form-message";


    try {

        // =================================================
        // CALCULATE AVERAGE
        // =================================================

        const average =
            avg(ratings);


        console.log(
            "Average rating:",
            average
        );


        // =================================================
        // AI ANALYSIS
        // =================================================

        let aiAnalysis = {

            sentiment:
                "Neutral",

            department:
                "General",

            issue_type:
                "General Feedback",

            urgency:
                "Low",

            engine:
                "Not analyzed"

        };


        if (
            window
                .analyzeFeedbackText
        ) {

            try {

                console.log(
                    "Starting AI analysis..."
                );


                aiAnalysis =
                    await window
                        .analyzeFeedbackText(

                            data.comments ||
                            ""

                        );


                console.log(
                    "AI analysis result:",
                    aiAnalysis
                );


            } catch (
                aiError
            ) {

                console.warn(
                    "AI analysis failed:",
                    aiError
                );


                // AI FAILURE SHOULD NOT STOP
                // FEEDBACK SUBMISSION

            }

        } else {

            console.log(
                "AI analysis function not available. Continuing without AI."
            );

        }


        // =================================================
        // CREATE FEEDBACK ID LOCALLY
        // =================================================

        const feedbackId =
            crypto.randomUUID();


        console.log(
            "Generated feedback ID:",
            feedbackId
        );


        // =================================================
        // MAIN FEEDBACK RECORD
        // =================================================

        const feedbackRecord = {

            id:
                feedbackId,


            guest_type:
                guestType,


            visit_purpose:
                data.visit_purpose ||
                (
                    guestType ===
                    "Resident"

                        ? "Room Stay"
                        : null
                ),


            name:
                data.name ||
                null,


            email:
                data.email ||
                null,


            phone:
                data.phone ||
                null,


            room_number:
                guestType ===
                "Resident"

                    ? data.room_number
                    : null,


            booking_type:
                guestType ===
                "Resident"

                    ? data.booking_type ||
                    null

                    : null,


            comments:
                data.comments ||
                null,


            average_rating:
                average,


            status:
                average <= 2

                    ? "New"
                    : "Received",


            resolution_notes:
                null,


            ai_sentiment:
                aiAnalysis
                    ?.sentiment ||
                null,


            ai_department:
                aiAnalysis
                    ?.department ||
                null,


            ai_issue_type:
                aiAnalysis
                    ?.issue_type ||
                null,


            ai_urgency:
                aiAnalysis
                    ?.urgency ||
                null,


            ai_engine:
                aiAnalysis
                    ?.engine ||
                null

        };


        console.log(
            "----------------------------------------"
        );

        console.log(
            "SUBMITTING MAIN FEEDBACK RECORD"
        );

        console.log(
            feedbackRecord
        );

        console.log(
            "----------------------------------------"
        );


        // =================================================
        // SAVE MAIN FEEDBACK
        // =================================================

        const {
            data: savedFeedback,
            error: feedbackError
        } =

            await window
                .nyumbaniSupabase
                .from(
                    "feedback"
                )
                .insert(
                    feedbackRecord
                )
                .select();


        console.log(
            "Feedback Supabase response data:",
            savedFeedback
        );


        console.log(
            "Feedback Supabase response error:",
            feedbackError
        );


        if (
            feedbackError
        ) {

            console.error(
                "========================================"
            );

            console.error(
                "FEEDBACK INSERT ERROR"
            );

            console.error(
                "Message:",
                feedbackError.message
            );

            console.error(
                "Code:",
                feedbackError.code
            );

            console.error(
                "Details:",
                feedbackError.details
            );

            console.error(
                "Hint:",
                feedbackError.hint
            );

            console.error(
                "Full error:",
                feedbackError
            );

            console.error(
                "========================================"
            );


            const databaseError =
                new Error(
                    feedbackError.message ||
                    "Unable to save feedback."
                );


            databaseError.code =
                feedbackError.code;

            databaseError.details =
                feedbackError.details;

            databaseError.hint =
                feedbackError.hint;

            databaseError.stage =
                "feedback";


            throw databaseError;

        }


        console.log(
            "MAIN FEEDBACK SAVED SUCCESSFULLY."
        );


        // =================================================
        // OBJECTIVE RATING ROWS
        // =================================================

        const ratingRows =
            ratings.map(

                rating => ({

                    feedback_id:
                        feedbackId,

                    category:
                        rating.category,

                    answer:
                        rating.answer,

                    hidden_score:
                        rating.rating

                })

            );


        console.log(
            "----------------------------------------"
        );

        console.log(
            "SUBMITTING RATING ROWS"
        );

        console.log(
            ratingRows
        );

        console.log(
            "----------------------------------------"
        );


        // =================================================
        // SAVE RATINGS
        // =================================================

        const {
            data: savedRatings,
            error: ratingsError
        } =

            await window
                .nyumbaniSupabase
                .from(
                    "feedback_ratings"
                )
                .insert(
                    ratingRows
                )
                .select();


        console.log(
            "Ratings Supabase response data:",
            savedRatings
        );


        console.log(
            "Ratings Supabase response error:",
            ratingsError
        );


        if (
            ratingsError
        ) {

            console.error(
                "========================================"
            );

            console.error(
                "RATINGS INSERT ERROR"
            );

            console.error(
                "Message:",
                ratingsError.message
            );

            console.error(
                "Code:",
                ratingsError.code
            );

            console.error(
                "Details:",
                ratingsError.details
            );

            console.error(
                "Hint:",
                ratingsError.hint
            );

            console.error(
                "Full error:",
                ratingsError
            );

            console.error(
                "========================================"
            );


            const databaseError =
                new Error(
                    ratingsError.message ||
                    "Unable to save feedback ratings."
                );


            databaseError.code =
                ratingsError.code;

            databaseError.details =
                ratingsError.details;

            databaseError.hint =
                ratingsError.hint;

            databaseError.stage =
                "feedback_ratings";


            throw databaseError;

        }


        console.log(
            "RATINGS SAVED SUCCESSFULLY."
        );


        // =================================================
        // COMPLETE SUCCESS
        // =================================================

        console.log(
            "========================================"
        );

        console.log(
            "FEEDBACK SUBMISSION COMPLETED SUCCESSFULLY"
        );

        console.log(
            "Feedback ID:",
            feedbackId
        );

        console.log(
            "========================================"
        );


        message.textContent =
            "Feedback submitted successfully.";


        message.className =
            "form-message success";


        // =================================================
        // RESET FORM OPTIONAL
        // =================================================

        // We do not reset immediately because
        // the user is being redirected.


        // =================================================
        // REDIRECT
        // =================================================

        setTimeout(() => {

            window.location.href =
                "thank-you.html";

        }, 500);


    } catch (
        error
    ) {

        console.error(
            "========================================"
        );

        console.error(
            "FULL SUBMISSION ERROR"
        );

        console.error(
            "Error:",
            error
        );

        console.error(
            "Stage:",
            error?.stage
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
            "Details:",
            error?.details
        );

        console.error(
            "Hint:",
            error?.hint
        );

        console.error(
            "========================================"
        );


        // =================================================
        // SHOW ACTUAL ERROR TEMPORARILY FOR DEBUGGING
        // =================================================

        let visibleError =
            error?.message ||
            "Unknown submission error";


        if (
            error?.stage ===
            "feedback"
        ) {

            visibleError =
                "Feedback database error: " +
                visibleError;

        }


        if (
            error?.stage ===
            "feedback_ratings"
        ) {

            visibleError =
                "Ratings database error: " +
                visibleError;

        }


        message.textContent =
            "Submission failed: " +
            visibleError;


        message.className =
            "form-message error";


        setSubmitState(
            submitButton,
            false
        );

    }

}


// =====================================================
// GLOBAL JAVASCRIPT ERROR DETECTOR
// =====================================================

window.addEventListener(
    "error",
    event => {

        console.error(
            "GLOBAL JAVASCRIPT ERROR:",
            event.error ||
            event.message
        );

    }
);


// =====================================================
// UNHANDLED PROMISE DETECTOR
// =====================================================

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "UNHANDLED PROMISE REJECTION:",
            event.reason
        );

    }
);


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Nyumbani feedback.js loaded."
        );


        // =================================================
        // DATE / TIME
        // =================================================

        setDateTime();


        // =================================================
        // RESIDENT QUESTIONS
        // =================================================

        renderQuestions(

            "residentRatings",

            residentCategories

        );


        // =================================================
        // NON-RESIDENT QUESTIONS
        // =================================================

        renderQuestions(

            "nonResidentRatings",

            nonResidentCategories

        );


        // =================================================
        // GLOBAL RATING BUTTON LISTENER
        // =================================================

        document
            .addEventListener(

                "click",

                handleChoice

            );


        // =================================================
        // RESIDENT FORM
        // =================================================

        const residentForm =
            document.getElementById(
                "residentForm"
            );


        // =================================================
        // NON-RESIDENT FORM
        // =================================================

        const nonResidentForm =
            document.getElementById(
                "nonResidentForm"
            );


        // =================================================
        // RESIDENT FORM LISTENER
        // =================================================

        if (
            residentForm
        ) {

            console.log(
                "Resident feedback form detected."
            );


            residentForm
                .addEventListener(

                    "submit",

                    submitFeedback

                );

        }


        // =================================================
        // NON-RESIDENT FORM LISTENER
        // =================================================

        if (
            nonResidentForm
        ) {

            console.log(
                "Non-resident feedback form detected."
            );


            nonResidentForm
                .addEventListener(

                    "submit",

                    submitFeedback

                );

        }


        // =================================================
        // SUPABASE CHECK
        // =================================================

        if (
            window.nyumbaniSupabase
        ) {

            console.log(
                "Nyumbani Supabase client is available to feedback.js."
            );

        } else {

            console.error(
                "Nyumbani Supabase client is NOT available."
            );

        }


        console.log(
            "Nyumbani feedback system ready."
        );

    }
);