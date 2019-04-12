import { Selector } from 'testcafe';

fixture('TestCafe Example')
    .page('http://localhost:9090');

function modulesListTabletop() {
    return Selector('#modulesList-1');
}

test('Test1', async t => {
    function setupKitchen() {
        return t
            .click('#checkbox-wallB')
            .click('#checkbox-wallC')
            .click('#drawKitchenButton');
    }

    await
        setupKitchen()
        // set black hanging
            .click('#modulesList-0-color')
            .click('#texture-2')
            .click('#chooseColorModalClose')

        // set color on tabletop
            .click('#modulesList-1-color')
            .click('#texture-2')
            .click('#chooseColorModalClose')

        // set sink
            .click(
                modulesListTabletop().child('li').withAttribute('value', '65006')
            )

        // set oven-tabletop
            .click(
                modulesListTabletop().child('li').withAttribute('value', '68000')
            )

        //set standing color
        // set oven
        // set drawers
        // set washer

    //assert scene and kitchen

        // assert that there is sink in standing
        // assert colors
        // assert textures set
        // assert meshes set (?)
    
    ;
});
