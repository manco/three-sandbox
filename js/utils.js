export function meshWidthX(m) {
    const bbox = m.geometry.boundingBox;
    return bbox.max.x - bbox.min.x;
}

export function makeEnum(arr){
    let obj = {};
    for (let val of arr){
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}