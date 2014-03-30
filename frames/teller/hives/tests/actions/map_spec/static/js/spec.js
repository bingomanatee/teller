describe("make_class", function () {

    var make_class;
    var _SUM_AND_PRODUCT;
    beforeEach(function () {
        var app = module('teller_app');
        inject(function (_make_class_) {
            make_class = _make_class_;
        });
        _SUM_AND_PRODUCT = {
            sum: function () {
                return this.a + this.b;
            },

            product: function () {
                return this.a * this.b;
            }
        };
    });

    describe('prototype with constructor and one mixin', function () {
        var BaseClass;

        beforeEach(function () {
            BaseClass = make_class(function (a, b) {
                this.a = a;
                this.b = b;
            }, _SUM_AND_PRODUCT);

        });

        describe('BaseClass', function () {

            it('should have a sum and product method', function () {
                var instance = new BaseClass(2, 5);
                assert.equal(instance.sum(), 7, 'sum method produces 7');
                assert.equal(instance.product(), 10, 'product method produces 10');
            })

        })
    });

    describe('prototype with constructor and multiple mixins', function () {
        var MultiClass;

        beforeEach(function () {
            MultiClass = make_class(
                function (a, b) {
                    this.a = a;
                    this.b = b;
                },
                {
                    sum: function () {
                        return this.a + this.b;
                    }
                },
                {
                    product: function () {
                        return this.a * this.b;
                    }
                }
            );

        });

        describe('MultiClass', function () {

            it('should have a sum and product method', function () {
                var instance = new MultiClass(2, 5);
                assert.equal(instance.sum(), 7, 'sum method produces 7');
                assert.equal(instance.product(), 10, 'product method produces 10');
            })

            describe('CompoundClass', function () {
                var Compound;

                beforeEach(function () {

                    Compound = make_class(function (a, b) {
                        this.a = a;
                        this.b = b;
                    }, MultiClass, {subtract: function () {
                        return this.a - this.b
                    }});

                });

                it('should have a sum, product and subtract method', function () {

                    var instance = new Compound(2, 5);
                    assert.equal(instance.sum(), 7, 'sum method produces 7');
                    assert.equal(instance.product(), 10, 'product method produces 10');
                    assert.equal(instance.subtract(), -3, 'subtract method produces 10');
                })

            })

        })
    });

    describe('prototype with no constructor and one mixin', function () {
        var NoConsClass;

        beforeEach(function () {
            NoConsClass = make_class(_SUM_AND_PRODUCT);
        });

        describe('NoConsClass', function () {

            it('should be able to construct a class without a constructor', function () {

                var instance = new NoConsClass({a: 4, b: 7});

                assert.equal(instance.sum(), 11, 'sum method produces 7');
                assert.equal(instance.product(), 28, 'product method produces 10');
            })

        })

    });
});