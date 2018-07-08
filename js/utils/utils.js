export function meshWidthX(m) {
    const bbox = m.geometry.boundingBox;
    return bbox.max.x - bbox.min.x;
}

export function meshDepthY(m) {
    const bbox = m.geometry.boundingBox;
    return bbox.max.y - bbox.min.y;
}

export function flatten(arr) {
    return [].concat(...arr)
}