describe('TestClass', function(){

    describe('#sum', function(){
        it ('should return the sum of two numbers', function(){
            var t = new TestClass(1, 3);
            assert.equal(t.sum(), 4, '1 + 3 = 4');

        })
    })
    describe('#product', function(){
        it ('should return the product of two numbers', function(){
            var t = new TestClass(2, 3);
            assert.equal(t.product(), 6, '2 * 3 = 6');

        })
    })
});