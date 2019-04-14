import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

fixture('Kuchnioplaner e2e')
    .page('http://localhost:9090');

function modulesListTabletopItem(id) {
    return Selector('#modulesList-1').child('li').withAttribute('value', id);
}

test('Test1', async t => {

    const kitchenHasStandingSink = ClientFunction(
        () => {
            const standing = kitchen.modules.byType(0);
            const standingSink = standing.find(m => m.subtype === 4);
            return standingSink !== undefined;
        }
    );

    let setupKitchen = () => {
        return t
            .click('#checkbox-wallB')
            .click('#checkbox-wallC')
            .click('#drawKitchenButton');
    }

    let setBlackColorForModule = (moduleListId) => {
        return t
            .click(moduleListId)
            .click('#texture-2')
            .click('#chooseColorModalClose');
    }

    await setupKitchen();
    await setBlackColorForModule('#modulesList-2-color') //hanging
    await setBlackColorForModule('#modulesList-1-color') //tabletop

    //TODO extract method select subtype for module

    // set sink
    let selectModule1 = modulesListTabletopItem('65006')

    await t.click(selectModule1)
            .click(
                selectModule1.child('select').child('option').withAttribute('value', '1')
            )

    let selectModule2 = modulesListTabletopItem('68000')
    // set oven-tabletop
    await t.click(selectModule2)
            .click(
                selectModule2.child('select').child('option').withAttribute('value', '3')
            )

        //set standing color
        // set oven
        // set drawers
        // set washer

    //assert scene and kitchen
            .expect(kitchenHasStandingSink()).ok()
        // assert that there is sink in standing
        // assert colors
        // assert textures set
        // assert meshes set (?)
    
    ;
});
