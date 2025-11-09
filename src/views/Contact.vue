<script setup>
	import { ref } from 'vue'
	import { useI18n } from 'vue-i18n'

	const { t } = useI18n()

	const form = ref({
		name: '',
		email: '',
		message: ''
	})
</script>

<template>
	<div class="page-contact">
		<h1>{{ t('contact.form.title') }}</h1>

		<div class="form-container">
			<div class="left-side">
				<h3>{{ t('contact.info.title') }}</h3>
				<p class="subtitle">{{ t('contact.info.subtitle') }}</p>

				<div class="contact-methods">
					<div class="contact-method">
						<h3>{{ t('contact.info.writeUs.title') }}</h3>
						<p>{{ t('contact.info.writeUs.email') }}</p>
					</div>

					<hr>
					<div class="contact-method">
						<h3>{{ t('contact.info.callUs.title') }}</h3>
						<p>{{ t('contact.info.callUs.phone') }}</p>
					</div>
					<hr>
				</div>
			</div>

			<div class="right-side">
				<form @submit.prevent="sendMessage" class="contact-form">
					<h3>{{ t('contact.form.subtitle') }}</h3>
					<i>{{ t('contact.form.soon') }}</i>

					<div class="form-group">
						<input type="text" v-model="form.name" placeholder=" " required />
						<label>{{ t('contact.form.name') }}</label>
					</div>

					<div class="form-group">
						<input type="email" v-model="form.email" placeholder=" " required />
						<label>{{ t('contact.form.email') }}</label>
					</div>

					<div class="form-group">
						<textarea v-model="form.message" rows="5" placeholder=" " required></textarea>
						<label>{{ t('contact.form.message') }}</label>
					</div>

					<div class="form-actions">
						<button type="submit" class="primary">
							{{ t('contact.form.send') }}
						</button>
					</div>

					<div class="success">
						{{ t('contact.form.success') }}
					</div>

					<div class="error">
						{{ t('contact.form.error') }}
					</div>
				</form>
			</div>
		</div>

		<section class="contact-image-section layout-full">
			<img src="https://placehold.co/1920x500" alt="Contact us" class="contact-image">
			<h3 class="image-text">{{ t('contact.imageSection.text') }}</h3>
		</section>
	</div>
</template>

<style lang="scss" scoped>
	.form-container {
		display: flex;
		justify-content: space-around;
		gap: 2rem;

		.left-side {
			text-align: left;

			.contact-method {
				margin-top: 2rem;
			}

			hr {
				margin: 2rem 0;
			}
		}

		.right-side {
			width: 100%;
			max-width: 500px;

			* {
				text-align: left;
				width: 100%;
			}
		}
	}

	.contact-image-section {
		margin-top: 5rem;
		position: relative;

		.contact-image {
			width: 100%;
			height: 400px;
			object-fit: cover;
			border-radius: 8px;
			filter: brightness(50%);
		}

		h3 {
			color: white;
			font-weight: 700;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
			z-index: 2;
		}
	}
</style>
