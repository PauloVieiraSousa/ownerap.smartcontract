const truffleAssert = require('truffle-assertions');

const Ownerap = artifacts.require('Ownerap');

const {
    decimals,
    ether,
    addressZero,
    owner1,
    owner2,
    owner3,
    owner4,
    owner5,
    nonowner1,
    nonowner2,
    info1,
    info2
  } = require('./dataTest');


  contract('Ownerap', function() {

    let ownerap
  
    beforeEach('setup for each test', async () => {
        ownerap = await Ownerap.new()
    })

    describe('Create - owner', function () {
    
        it('check if creator is owner at create', async() => {
            /* */            
            var response = await ownerap.owner(owner1)
            console.log ('response: ' + response)
            assert.equal(response, true, 'owner is wrong at create')
        }) 

        //O que mais deve ser verificado com o owner na criação do contrato?
    });
   
    describe('Create - quant', function () {
        it('check if minApproval = 1 at create', async() => {
            var response = await ownerap.minApproval()
            assert.equal(response, 1, 'minApproval is wrong at create')            
        })
        
        it('check if quantOwner = 1 at create', async() => {         
            var response = await ownerap.quantOwner()
            assert.equal(response, 1, 'quantOwner is wrong at create')     
        })

        //O que mais deve ser verificado na criação do contrato?
    });    

    describe('Approval', function () {

        it('owner can approve', async() => {
            await truffleAssert.passes(ownerap.doApproval({from: owner1 }))
        })

        it('nononwer cannont doApproval', async() => {
            await truffleAssert.reverts(ownerap.doApproval({from: nonowner1 }))
        })        
        
    });

    describe('setInfo', function () {

        it('should be set new message in setInfo', async() => {
            await ownerap.doApproval({from: owner1 });
            let message = "example";
            await truffleAssert.passes(ownerap.setInfo(message, {from: owner1 }));
            assert.equal(await ownerap.info(), message, 'message not equal:' + message)     
        })

        // it('should be current approvals is less then minimum', async() => {
        //     await truffleAssert.reverts(ownerap.setInfo("example", {from: owner1 }), 'current approvals is less then minimum')
        // })

    });

    describe('Cancel approval', function() {

        it('must be canceled approval', async() => {
            await ownerap.doApproval({from: owner1 })
            await truffleAssert.passes(ownerap.cancelApproval({from: owner1 }))
        });

        it('should return address must be owner', async() => {
            await ownerap.doApproval({from: owner1 })
            await truffleAssert.reverts(ownerap.cancelApproval({from: owner2 }), "address must be owner")
        });

        it('should return address not approved yet', async() => {
            await truffleAssert.reverts(ownerap.cancelApproval({from: owner1 }), "address not approved yet")
        });

    });

    describe('resetAllApproval', function () {

        it('should be reset all approval', async () => {
            await ownerap.doApproval({from: owner1 });
            await truffleAssert.passes(ownerap.resetAllApproval({from: owner1 }));     
        });

        it('should return address must be owner', async () => {
            await truffleAssert.reverts(ownerap.resetAllApproval({from: owner2 }), 'address must be owner');     
        });

        it('should return an approval', async () => {
            let listApproval;

            await ownerap.doApproval({from: owner1 });
            listApproval = await ownerap.listApproval();
            
            assert(listApproval.length, 2);
            await ownerap.resetAllApproval({from: owner1 });    
            
            listApproval = await ownerap.listApproval();
            assert(listApproval.length, 1);
        });

    });

    describe('checkApproval', function () {
        
        it('should be an owner for approval', async() => {
            await ownerap.doApproval({from: owner1 });
            let result = await ownerap.checkApproval(owner1);
            assert.equal(result, 1, 'not returned an owner for approval');     
        });

    });

    describe('countApproval', function () {

        it('must return an approval', async() => {
            await ownerap.doApproval({from: owner1 });
            let result = await ownerap.countApproval({from: owner1 });
            assert.equal(result, 1, 'did not return any approval');     
        })

        it('must return an approval', async() => {
            let result = await ownerap.countApproval({from: owner1 });
            assert.equal(result, 0, 'returned an approval');     
        })
    });


    describe('listApproval', function () {
        const listApproval = [];
        
        beforeEach('setup for each test', async  () => {
            await ownerap.doApproval({from: owner1 });

            listApproval[0] = '0x0000000000000000000000000000000000000000';
            listApproval[1] = owner1;
        });

        it('must return a listApproval', async() => {
            let list = await ownerap.listApproval({from: owner1 });    
            list.map((item, key ) => assert.equal(item.toUpperCase(), listApproval[key].toUpperCase()));
        });
    });

    describe('addOwner', () => {
        
        beforeEach('setup for each test owner', async () => {
            await ownerap.doApproval({from: owner1 });
        });

        it('should be add other owner', async () => {
            await truffleAssert.passes(ownerap.addOwner(owner2, {from: owner1 }))
            const quantOwner = await ownerap.quantOwner()
            assert.equal(quantOwner, 2, 'quantOwner is wrong at create') 
        });

        it('should be address must be owner', async () => {
            await truffleAssert.reverts(ownerap.addOwner(owner2, {from: owner3 }), 'address must be owner')
        });

        it('should be owner exists', async () => {
            await truffleAssert.reverts(ownerap.addOwner(owner1, {from: owner1 }), 'owner exists')
        });

        it('should be current approvals is less then minimum', async () => {
            await ownerap.cancelApproval({from: owner1 });
            await truffleAssert.reverts(ownerap.addOwner(owner2, {from: owner1 }), 'current approvals is less then minimum')
        });
    })
})