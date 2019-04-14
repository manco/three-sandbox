import {ClientFunction, Selector} from 'testcafe';

fixture('Kuchnioplaner e2e')
    .page('http://localhost:9090');

test('Test1', async t => {

    const kitchenHasStandingUnderSinkInWood = ClientFunction(
        () => {
            const standing = kitchen.modules.byType(0);
            const standingSink = standing.find(m => m.subtype === 4);
            return
                standingSink.color === 3
               && standingSink.getFrontTexture().name === '313'
                ;
        }
    );

    const setupKitchen = () => {
        return t
            .click('#checkbox-wallB')
            .click('#checkbox-wallC')
            .click('#drawKitchenButton');
    }

    const setColorForModuleType = (moduleListId, colorType) => {
        return t
            .click(moduleListId)
            .click('#texture-' + colorType)
            .click('#chooseColorModalClose');
    }

    const selectSubtypeForModule = (moduleListId, moduleItem, subtype) => {
        const selectedItem = Selector(moduleListId).child('li').withAttribute('value', moduleItem) //'65006'
        const selectedSubtype = selectedItem.child('select').child('option').withAttribute('value', subtype) //'1'

        return t.click(selectedItem).click(selectedSubtype)
    }

    await setupKitchen();
    await setColorForModuleType('#modulesList-2-color', '2'); //hanging, black
    await setColorForModuleType('#modulesList-1-color', '2'); //tabletop, black
    await selectSubtypeForModule('#modulesList-1', '65006', '1'); // set sink
    await selectSubtypeForModule('#modulesList-1',  '68000', '3'); //set oven-tabletop
    await setColorForModuleType('#modulesList-0-color', '3'); //standing, wood
        // set drawers

        await t
            .expect(kitchenHasStandingUnderSinkInWood).ok()
        // assert that there is sink in standing
        // assert all standings / hanging / tabletops have expected color
        // assert all standings / hanging / tabletops have expected textures (difficult)
        // assert standing drawers have expected mesh
    
    ;
});
