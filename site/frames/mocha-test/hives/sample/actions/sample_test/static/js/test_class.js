function TestClass(a, b){
    this.a = a;
    this.b = b;
}

TestClass.prototype = {
    sum: function(){
        return this.a + this.b;
    },

    product: function(){
        return this.a * this.b;
    }
};