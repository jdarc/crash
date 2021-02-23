import Material from "./Material";

export default function(vertexBuffer, indexBuffer) {
    return {
        render(renderer, material) {
            renderer.draw(vertexBuffer, indexBuffer, material || Material.DEFAULT);
        }
    }
}
