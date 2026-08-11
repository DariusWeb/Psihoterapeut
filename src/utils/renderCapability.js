// backdrop-filter is composited on the GPU; without one, Chrome re-blurs the region on the CPU
function hasGpuCompositing() {
	try {
		const canvas = document.createElement('canvas')
		const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
		if (!gl) return false

		// SwiftShader/ANGLE-on-CPU answer getContext, so the renderer string is what separates them.
		const info = gl.getExtension('WEBGL_debug_renderer_info')
		const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
		const loseContext = gl.getExtension('WEBGL_lose_context')
		loseContext?.loseContext()

		return !/swiftshader|llvmpipe|software|basic render/i.test(renderer)
	} catch {
		return false
	}
}

export function initRenderCapability() {
	if (!hasGpuCompositing()) document.documentElement.classList.add('no-gpu-blur')
}
