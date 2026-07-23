<script>
    export default {
        name: 'Event',
        meta: {
            id: 1,
            title: 'Event Title 1',
            details: 'Event details here',
            image: null,
            date: '2026-09-15',
            location: 'Online',
        }
    }
</script>

<template>
    <article class="event-content">
        <p>Here goes the event description with full HTML support...</p>

        <h2>What to expect</h2>
        <ul>
            <li>Introduction and grounding exercise</li>
            <li>Guided discussion</li>
            <li>Questions and closing</li>
        </ul>

        <h2>Who it is for</h2>
        <p>Details about who this event is intended for...</p>
    </article>
</template>
