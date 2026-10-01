// =====================================================
// NYUMBANI HOTEL
// SUPABASE DASHBOARD / FEEDBACK / COMPLAINTS
// =====================================================


// =====================================================
// BASIC HELPERS
// =====================================================

function fmt(iso) {

    if (!iso) {
        return "";
    }

    try {

        return new Date(iso)
            .toLocaleString();

    }

    catch {

        return iso;
    }
}


// =====================================================
// SAFE HTML
// =====================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// SCORE LABEL
// =====================================================

function ratingLabel(value) {

    const score =
        Math.round(
            Number(value || 0)
        );

    switch (score) {

        case 5:
            return "Very Good";

        case 4:
            return "Good";

        case 3:
            return "Average";

        case 2:
            return "Poor";

        case 1:
            return "Very Poor";

        default:
            return "-";
    }
}


// =====================================================
// GET RATINGS ARRAY
// =====================================================

function getRatings(item) {

    if (
        Array.isArray(
            item.feedback_ratings
        )
    ) {

        return item.feedback_ratings;
    }

    if (
        Array.isArray(
            item.ratings
        )
    ) {

        return item.ratings;
    }

    return [];
}


// =====================================================
// OBJECTIVE RATINGS LIST
// =====================================================

function objectiveList(item) {

    const ratings =
        getRatings(item);

    if (!ratings.length) {

        return `
            <span class="muted">
                No category ratings
            </span>
        `;
    }


    return `
        <ul class="objective-mini">

            ${ratings.map(
                rating => `
                    <li>
                        <strong>
                            ${escapeHtml(rating.category)}:
                        </strong>

                        ${escapeHtml(
                            rating.answer ||
                            ratingLabel(
                                rating.hidden_score ||
                                rating.rating
                            )
                        )}
                    </li>
                `
            ).join("")}

        </ul>
    `;
}


// =====================================================
// CALCULATE AVERAGE
// =====================================================

function calculateAverage(items) {

    if (!items.length) {
        return "0.0";
    }


    const valid =
        items.filter(
            item =>
                item.average_rating !== null &&
                item.average_rating !== undefined &&
                !Number.isNaN(
                    Number(
                        item.average_rating
                    )
                )
        );


    if (!valid.length) {
        return "0.0";
    }


    const total =
        valid.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.average_rating
                ),
            0
        );


    return (
        total /
        valid.length
    ).toFixed(1);
}


// =====================================================
// DISPLAY DATABASE ERROR
// =====================================================

function showDatabaseError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "form-message error";
}


// =====================================================
// GET FEEDBACK FROM SUPABASE
// =====================================================

async function getOnlineFeedback() {

    if (
        !window.nyumbaniSupabase
    ) {

        console.error(
            "Supabase client is not available."
        );

        return {
            data: [],
            error: new Error(
                "Supabase client is not available."
            )
        };
    }


    const {
        data,
        error
    } =
        await window
            .nyumbaniSupabase
            .from("feedback")
            .select(`
                id,
                guest_type,
                visit_purpose,
                name,
                email,
                phone,
                room_number,
                booking_type,
                comments,
                average_rating,
                status,
                resolution_notes,
                created_at,
                ai_sentiment,
                ai_department,
                ai_issue_type,
                ai_urgency,
                ai_engine,
                feedback_ratings (
                    id,
                    category,
                    answer,
                    hidden_score
                )
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Feedback loading error:",
            error
        );
    }


    return {
        data: data || [],
        error
    };
}


// =====================================================
// DASHBOARD
// =====================================================

async function renderDashboard() {

    const totalElement =
        document.getElementById(
            "totalFeedback"
        );


    if (!totalElement) {
        return;
    }


    const message =
        document.getElementById(
            "dashboardMessage"
        );


    if (message) {

        message.textContent =
            "Loading dashboard...";

        message.className =
            "form-message";
    }


    const {
        data: items,
        error
    } =
        await getOnlineFeedback();


    if (error) {

        showDatabaseError(
            "dashboardMessage",
            "Unable to load dashboard data."
        );

        return;
    }


    const residents =
        items.filter(
            item =>
                item.guest_type ===
                "Resident"
        );


    const nonResidents =
        items.filter(
            item =>
                item.guest_type ===
                "Non-Resident"
        );


    const openComplaints =
        items.filter(
            item => {

                const average =
                    Number(
                        item.average_rating
                    );

                const status =
                    item.status ||
                    "Received";


                return (
                    average <= 2 &&
                    status !== "Resolved"
                );
            }
        );


    document.getElementById(
        "totalFeedback"
    ).textContent =
        items.length;


    document.getElementById(
        "residentCount"
    ).textContent =
        residents.length;


    document.getElementById(
        "nonResidentCount"
    ).textContent =
        nonResidents.length;


    document.getElementById(
        "averageRating"
    ).textContent =
        calculateAverage(
            items
        );


    document.getElementById(
        "openComplaints"
    ).textContent =
        openComplaints.length;


    const body =
        document.getElementById(
            "recentFeedbackBody"
        );


    if (body) {

        const recent =
            items.slice(
                0,
                10
            );


        body.innerHTML =
            recent.length
                ? recent.map(
                    item => {

                        const roomPurpose =
                            item.guest_type ===
                            "Resident"
                                ? (
                                    item.room_number
                                        ? `Room ${escapeHtml(item.room_number)}`
                                        : "Room not provided"
                                )
                                : (
                                    escapeHtml(
                                        item.visit_purpose ||
                                        "-"
                                    )
                                );


                        return `
                            <tr>

                                <td>
                                    ${escapeHtml(
                                        fmt(
                                            item.created_at
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        item.guest_type
                                    )}
                                </td>

                                <td>
                                    ${roomPurpose}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        ratingLabel(
                                            item.average_rating
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        item.status ||
                                        "Received"
                                    )}
                                </td>

                            </tr>
                        `;
                    }
                ).join("")
                : `
                    <tr>
                        <td colspan="5">
                            No feedback yet.
                        </td>
                    </tr>
                `;
    }


    if (message) {

        message.textContent = "";

        message.className =
            "form-message";
    }
}


// =====================================================
// FULL FEEDBACK PAGE
// =====================================================

async function renderFeedback() {

    const body =
        document.getElementById(
            "feedbackTableBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `
        <tr>
            <td colspan="8">
                Loading feedback...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } =
        await getOnlineFeedback();


    if (error) {

        body.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load feedback.
                </td>
            </tr>
        `;

        return;
    }


    let items =
        data;


    const filter =
        document.getElementById(
            "guestTypeFilter"
        );


    if (
        filter &&
        filter.value
    ) {

        items =
            items.filter(
                item =>
                    item.guest_type ===
                    filter.value
            );
    }


    body.innerHTML =
        items.length
            ? items.map(
                item => {

                    const roomPurpose =
                        item.guest_type ===
                        "Resident"
                            ? (
                                item.room_number
                                    ? `Room ${escapeHtml(item.room_number)}`
                                    : "-"
                            )
                            : escapeHtml(
                                item.visit_purpose ||
                                "-"
                            );


                    const aiInfo =
                        item.ai_sentiment ||
                        item.ai_department ||
                        item.ai_urgency
                            ? `
                                <div class="ai-mini">

                                    <strong>
                                        AI:
                                    </strong>

                                    ${escapeHtml(
                                        item.ai_sentiment ||
                                        "Unknown"
                                    )}

                                    •

                                    ${escapeHtml(
                                        item.ai_department ||
                                        "General"
                                    )}

                                    •

                                    ${escapeHtml(
                                        item.ai_urgency ||
                                        "Normal"
                                    )}

                                </div>
                            `
                            : "";


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    fmt(
                                        item.created_at
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.name ||
                                    "Anonymous"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.guest_type
                                )}
                            </td>

                            <td>
                                ${roomPurpose}
                            </td>

                            <td>

                                ${objectiveList(
                                    item
                                )}

                                ${aiInfo}

                            </td>

                            <td>
                                ${escapeHtml(
                                    item.comments ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.status ||
                                    "Received"
                                )}
                            </td>

                            <td>

                                <a
                                    class="text-link"
                                    href="reports.html?id=${encodeURIComponent(
                                        item.id
                                    )}"
                                >
                                    Print
                                </a>

                            </td>

                        </tr>
                    `;
                }
            ).join("")
            : `
                <tr>
                    <td colspan="8">
                        No feedback found.
                    </td>
                </tr>
            `;
}


// =====================================================
// UPDATE COMPLAINT
// =====================================================

async function updateComplaint(
    id,
    field,
    value
) {

    const allowedFields = [
        "status",
        "resolution_notes"
    ];


    if (
        !allowedFields.includes(
            field
        )
    ) {

        console.error(
            "Invalid complaint field:",
            field
        );

        return;
    }


    const updateData = {};

    updateData[field] =
        value;


    const {
        error
    } =
        await window
            .nyumbaniSupabase
            .from("feedback")
            .update(
                updateData
            )
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Complaint update error:",
            error
        );

        alert(
            "The complaint could not be updated."
        );

        return;
    }


    console.log(
        "Complaint updated successfully."
    );


    await renderComplaints();


    await renderDashboard();
}


// =====================================================
// COMPLAINTS
// =====================================================

async function renderComplaints() {

    const body =
        document.getElementById(
            "complaintsTableBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `
        <tr>
            <td colspan="7">
                Loading complaints...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } =
        await getOnlineFeedback();


    if (error) {

        body.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load complaints.
                </td>
            </tr>
        `;

        return;
    }


    const items =
        data.filter(
            item =>
                Number(
                    item.average_rating
                ) <= 2
        );


    body.innerHTML =
        items.length
            ? items.map(
                item => {

                    const roomPurpose =
                        item.guest_type ===
                        "Resident"
                            ? (
                                item.room_number
                                    ? `Room ${escapeHtml(item.room_number)}`
                                    : "-"
                            )
                            : escapeHtml(
                                item.visit_purpose ||
                                "-"
                            );


                    const currentStatus =
                        item.status ||
                        "New";


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    fmt(
                                        item.created_at
                                    )
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.name ||
                                    "Anonymous"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.guest_type
                                )}
                            </td>

                            <td>
                                ${roomPurpose}
                            </td>

                            <td>
                                ${escapeHtml(
                                    item.comments ||
                                    "-"
                                )}
                            </td>

                            <td>

                                <select
                                    class="status-select"
                                    data-id="${escapeHtml(
                                        item.id
                                    )}"
                                >

                                    ${[
                                        "New",
                                        "Assigned",
                                        "In Progress",
                                        "Resolved"
                                    ].map(
                                        status => `
                                            <option
                                                value="${escapeHtml(status)}"
                                                ${
                                                    currentStatus === status
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escapeHtml(status)}
                                            </option>
                                        `
                                    ).join("")}

                                </select>

                            </td>

                            <td>

                                <input
                                    class="notes-input"
                                    data-id="${escapeHtml(
                                        item.id
                                    )}"
                                    value="${escapeHtml(
                                        item.resolution_notes ||
                                        ""
                                    )}"
                                    placeholder="Add notes"
                                >

                            </td>

                        </tr>
                    `;
                }
            ).join("")
            : `
                <tr>
                    <td colspan="7">
                        No complaints found.
                    </td>
                </tr>
            `;


    document
        .querySelectorAll(
            ".status-select"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    async event => {

                        await updateComplaint(
                            event.target.dataset.id,
                            "status",
                            event.target.value
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".notes-input"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "change",
                    async event => {

                        await updateComplaint(
                            event.target.dataset.id,
                            "resolution_notes",
                            event.target.value
                        );
                    }
                );
            }
        );
}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await renderDashboard();

        await renderFeedback();

        await renderComplaints();


        const guestTypeFilter =
            document.getElementById(
                "guestTypeFilter"
            );


        if (guestTypeFilter) {

            guestTypeFilter.addEventListener(
                "change",
                async function () {

                    await renderFeedback();
                }
            );
        }


        const refreshFeedback =
            document.getElementById(
                "refreshFeedback"
            );


        if (refreshFeedback) {

            refreshFeedback.addEventListener(
                "click",
                async function () {

                    await renderFeedback();
                }
            );
        }


        const refreshDashboard =
            document.getElementById(
                "refreshDashboard"
            );


        if (refreshDashboard) {

            refreshDashboard.addEventListener(
                "click",
                async function () {

                    await renderDashboard();
                }
            );
        }

    }
);