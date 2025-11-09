<script setup>
	import HeroHome from '@/components/home/HeroHome.vue'
	import AboutYou from '@/components/home/AboutYou.vue'
	import Operations from '@/components/home/Operations.vue'
	import Topics from '@/components/home/Topics.vue'
	import Events from '@/components/home/Events.vue'
	import Testimonials from '@/components/home/Testimonials.vue'
	import RecentArticles from '@/components/home/RecentArticles.vue'
	import Newsletter from '@/components/common/Newsletter.vue'
</script>

<template>
	<main class="page-home">
		<HeroHome />
		<AboutYou />
		<Operations />
		<Topics />
		<Events />
		<Testimonials />
		<RecentArticles />
		<Newsletter />
	</main>
</template>

<style lang="scss" scoped>
	.page-home {
		.header-wrap {
			position: relative;
			min-height: 500px;

			img {
				width: 100%;
				height: 500px;
				object-fit: cover;
			}

			.header-content {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				max-width: 500px;
				margin: 0 auto;
				padding: 45px;
				background-color: rgba(0, 0, 0, 0.5);
				border-radius: 35px;
			}
		}
	}
</style>
