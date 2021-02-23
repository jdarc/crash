export default (parts) => {
    return {
        render(renderer) {
            parts.forEach((mesh, material) => mesh.render(renderer, material))
        }
    }
}
