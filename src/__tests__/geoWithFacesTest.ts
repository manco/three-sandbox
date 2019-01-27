import {Mesh} from "three";
import {BufferGeometry} from "three";
import {OBJLoader} from "three";
import '../../node_modules/three/examples/js/loaders/OBJLoader';

test('geometry loaded with two groups from fake materials', () => {

    const text = `
o cube

v -0.500000 -0.500000 0.500000
v 0.500000 -0.500000 0.500000
v -0.500000 0.500000 0.500000
v 0.500000 0.500000 0.500000
v -0.500000 0.500000 -0.500000
v 0.500000 0.500000 -0.500000
v -0.500000 -0.500000 -0.500000
v 0.500000 -0.500000 -0.500000

g cube
usemtl mat1
f 1/1/1 2/2/1 3/3/1
usemtl mat2
f 3/3/1 2/2/1 4/4/1
f 3/1/2 4/2/2 5/3/2
f 5/3/2 4/2/2 6/4/2
f 5/4/3 6/3/3 7/2/3
f 7/2/3 6/3/3 8/1/3
f 7/1/4 8/2/4 1/3/4
f 1/3/4 8/2/4 2/4/4
f 2/1/5 8/2/5 4/3/5
f 4/3/5 8/2/5 6/4/5
f 7/1/6 1/2/6 5/3/6
f 5/3/6 1/2/6 3/4/6
    `;

    const mesh = new OBJLoader().parse(text).children[0] as Mesh;

    const geo = mesh.geometry as BufferGeometry;
    expect(geo.groups.length).toBeGreaterThan(0);
});