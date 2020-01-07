import {ClientFunction, Selector} from 'testcafe';

fixture('Kuchnioplaner e2e')
    .page('http://localhost:9090');

test('Test1', async t => {

    const kitchenHasStandingUnderSinkInWood = ClientFunction(
        () => {
            const standing = kitchen.modules.byType("STANDING");
            const standingSink = standing.find(m => m.subtype === "UNDER_SINK");
            return
                standingSink.color === "WOOD"
               && standingSink.getFrontTexture().name === 'WOODUNDER_SINK'
                ;
        }
    );

    const setupKitchen = () => {
        return t
            .click('#B')
            .click('#C')
            .click('#drawKitchenButton');
    }

    const setColorForModuleType = (moduleListId, colorType) => {
        return t
            .click(moduleListId)
            .click('#texture-' + colorType)
            .click('#chooseColorModalClose');
    }

    const selectSubtypeForModule = (moduleListId, moduleItem, subtype) => {
        const selectedItem = Selector(moduleListId).child('li').withAttribute('value', moduleItem)
        const selectedSubtype = selectedItem.child('select').child('option').withAttribute('value', subtype)

        return t.click(selectedItem).click(selectedSubtype)
    }

    await setupKitchen();
    await setColorForModuleType('#modulesList-HANGING-color', 'GRAY'); //hanging, gray
    await setColorForModuleType('#modulesList-TABLETOP-color', 'GRAY'); //tabletop, gray
    await selectSubtypeForModule('#modulesList-TABLETOP', '65014', 'SINK'); // set sink
    await selectSubtypeForModule('#modulesList-TABLETOP',  '68026', 'OVEN_TABLETOP'); //set oven-tabletop
    await setColorForModuleType('#modulesList-STANDING-color', 'WOOD'); //standing, wood
        // set drawers

        await t
            .expect(kitchenHasStandingUnderSinkInWood).ok()
        // assert that there is sink in standing
        // assert all standings / hanging / tabletops have expected color
        // assert all standings / hanging / tabletops have expected textures (difficult)
        // assert standing drawers have expected mesh
    
    ;
});
