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

const objectiveScale = [
    { label: "Very Good", score: 5 },
    { label: "Good", score: 4 },
    { label: "Average", score: 3 },
    { label: "Poor", score: 2 },
    { label: "Very Poor", score: 1 }
];

function stars(score) {
    return "★".repeat(score) + "☆".repeat(5 - score);
}

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

            <strong>${category}</strong>

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

function renderQuestions(id, categories) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerHTML = categories
        .map(createQuestion)
        .join("");
}

function bubble(x, y, symbol) {
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
        Number(button.dataset.score);

    const label =
        button.dataset.label;

    const key =
        question.dataset.key;

    question.querySelector(
        `input[name="rating_${key}"]`
    ).value = score;

    document.getElementById(
        "summary_" + key
    ).textContent =
        `${label} — ${stars(score)}`;

    document.getElementById(
        "note_" + key
    ).style.display =
        score <= 2
            ? "block"
            : "none";

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

function collectRatings(form) {
    return [
        ...form.querySelectorAll(
            ".feedback-question"
        )
    ]
        .map(question => {

            const key =
                question.dataset.key;

            const value =
                question.querySelector(
                    `input[name="rating_${key}"]`
                ).value;

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

function avg(ratings) {
    if (!ratings.length) {
        return 0;
    }

    const total =
        ratings.reduce(
            (sum, rating) =>
                sum + rating.rating,
            0
        );

    return Number(
        (
            total /
            ratings.length
        ).toFixed(2)
    );
}

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

async function submitFeedback(event) {
    event.preventDefault();

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

    const data =
        Object.fromEntries(
            new FormData(form)
                .entries()
        );

    const ratings =
        collectRatings(form);

    const expected =
        guestType === "Resident"
            ? residentCategories.length
            : nonResidentCategories.length;

    // ----------------------------
    // CHECK ALL OBJECTIVE ANSWERS
    // ----------------------------

    if (
        ratings.length <
        expected
    ) {
        message.textContent =
            "Please select an answer for every category.";

        message.className =
            "form-message error";

        return;
    }

    // ----------------------------
    // ROOM NUMBER REQUIRED
    // ----------------------------

    if (
        guestType === "Resident" &&
        !data.room_number.trim()
    ) {
        message.textContent =
            "Room Number is required for resident feedback.";

        message.className =
            "form-message error";

        return;
    }

    // ----------------------------
    // NON-RESIDENT PURPOSE REQUIRED
    // ----------------------------

    if (
        guestType ===
            "Non-Resident" &&
        !data.visit_purpose
    ) {
        message.textContent =
            "Please select the purpose of your visit.";

        message.className =
            "form-message error";

        return;
    }

    setSubmitState(
        submitButton,
        true
    );

    message.textContent =
        "Submitting your feedback...";

    message.className =
        "form-message";

    try {

        const average =
            avg(ratings);

        // ----------------------------
        // AI ANALYSIS
        // ----------------------------

        let aiAnalysis = {
            sentiment: "Neutral",
            department: "General",
            issue_type:
                "General Feedback",
            urgency: "Low",
            engine:
                "Not analyzed"
        };

        if (
            window
                .analyzeFeedbackText
        ) {
            try {

                aiAnalysis =
                    await window
                        .analyzeFeedbackText(
                            data.comments ||
                                ""
                        );

            } catch (
                aiError
            ) {
                console.warn(
                    "AI analysis failed:",
                    aiError
                );
            }
        }

        // ----------------------------
        // CREATE FEEDBACK ID LOCALLY
        // ----------------------------

        const feedbackId =
            crypto.randomUUID();

        // ----------------------------
        // MAIN FEEDBACK RECORD
        // ----------------------------

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
                    .sentiment ||
                null,

            ai_department:
                aiAnalysis
                    .department ||
                null,

            ai_issue_type:
                aiAnalysis
                    .issue_type ||
                null,

            ai_urgency:
                aiAnalysis
                    .urgency ||
                null,

            ai_engine:
                aiAnalysis
                    .engine ||
                null
        };

        // ----------------------------
        // SAVE MAIN FEEDBACK
        // ----------------------------

        const {
            error:
                feedbackError
        } =
            await window
                .nyumbaniSupabase
                .from(
                    "feedback"
                )
                .insert(
                    feedbackRecord
                );

        if (
            feedbackError
        ) {
            console.error(
                "Feedback insert error:",
                feedbackError
            );

            throw new Error(
                feedbackError.message
            );
        }

        // ----------------------------
        // OBJECTIVE ANSWERS
        // ----------------------------

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

        const {
            error:
                ratingsError
        } =
            await window
                .nyumbaniSupabase
                .from(
                    "feedback_ratings"
                )
                .insert(
                    ratingRows
                );

        if (
            ratingsError
        ) {
            console.error(
                "Ratings insert error:",
                ratingsError
            );

            throw new Error(
                ratingsError.message
            );
        }

        // ----------------------------
        // SUCCESS
        // ----------------------------

        message.textContent =
            "Feedback submitted successfully.";

        message.className =
            "form-message success";

        setTimeout(() => {
            window.location.href =
                "thank-you.html";
        }, 500);

    } catch (error) {

        console.error(
            "Submission failed:",
            error
        );

        message.textContent =
            "We could not submit your feedback. Please try again.";

        message.className =
            "form-message error";

        setSubmitState(
            submitButton,
            false
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setDateTime();

        renderQuestions(
            "residentRatings",
            residentCategories
        );

        renderQuestions(
            "nonResidentRatings",
            nonResidentCategories
        );

        document
            .addEventListener(
                "click",
                handleChoice
            );

        const residentForm =
            document.getElementById(
                "residentForm"
            );

        const nonResidentForm =
            document.getElementById(
                "nonResidentForm"
            );

        if (
            residentForm
        ) {
            residentForm
                .addEventListener(
                    "submit",
                    submitFeedback
                );
        }

        if (
            nonResidentForm
        ) {
            nonResidentForm
                .addEventListener(
                    "submit",
                    submitFeedback
                );
        }
    }
);