// =====================================================
// NYUMBANI HOTEL DIGITAL FEEDBACK
// SERVICE WORKER
// =====================================================

const CACHE_NAME = "nyumbani-feedback-v1";


// Core files that can be available offline
const STATIC_FILES = [
    "./",
    "./index.html",
    "./resident.html",
    "./nonresident.html",
    "./thank-you.html",

    "./css/style.css",

    "./js/supabase.js",
    "./js/storage.js",
    "./js/ai.js",
    "./js/auth.js",
    "./js/dashboard.js",
    "./js/feedback.js",
    "./js/reports.js",
    "./js/settings.js",

    "./assets/logo.png",
    "./assets/bed-room.jpg",

    "./admin/login.html",
    "./admin/dashboard.html",
    "./admin/feedback.html",
    "./admin/complaints.html",
    "./admin/reports.html",
    "./admin/ai-insights.html",
    "./admin/staff.html",
    "./admin/settings.html",

    "./manifest.json"
];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "Nyumbani Service Worker installing..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)

                .then(cache => {

                    return cache.addAll(
                        STATIC_FILES
                    );

                })

                .then(() => {

                    return self.skipWaiting();

                })

        );

    }
);


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "Nyumbani Service Worker activated."
        );


        event.waitUntil(

            caches
                .keys()

                .then(cacheNames => {

                    return Promise.all(

                        cacheNames.map(
                            cacheName => {

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


// =====================================================
// FETCH
// =====================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        // Only work with GET requests.
        if (
            request.method !== "GET"
        ) {

            return;
        }


        const url =
            new URL(
                request.url
            );


        // -------------------------------------------------
        // DO NOT CACHE SUPABASE OR OTHER EXTERNAL REQUESTS
        // -------------------------------------------------

        if (
            url.origin !==
            self.location.origin
        ) {

            return;
        }


        // -------------------------------------------------
        // HTML / PAGE NAVIGATION
        // Network first, cache fallback
        // -------------------------------------------------

        if (
            request.mode ===
            "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        const copy =
                            response.clone();


                        caches
                            .open(CACHE_NAME)

                            .then(cache => {

                                cache.put(
                                    request,
                                    copy
                                );

                            });


                        return response;

                    })

                    .catch(async () => {

                        const cached =
                            await caches.match(
                                request
                            );


                        if (cached) {

                            return cached;

                        }


                        return caches.match(
                            "./index.html"
                        );

                    })

            );


            return;
        }


        // -------------------------------------------------
        // STATIC FILES
        // Cache first, network fallback
        // -------------------------------------------------

        event.respondWith(

            caches
                .match(request)

                .then(cachedResponse => {

                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(request)

                        .then(response => {

                            if (
                                !response ||
                                response.status !== 200
                            ) {

                                return response;

                            }


                            const responseCopy =
                                response.clone();


                            caches
                                .open(CACHE_NAME)

                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseCopy
                                    );

                                });


                            return response;

                        });

                })

        );

    }
);


// =====================================================
// MESSAGE SUPPORT
// =====================================================

self.addEventListener(
    "message",
    event => {

        if (
            event.data ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);