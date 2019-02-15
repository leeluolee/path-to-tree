const expect = require('expect.js');
const Tree = require('../lib/tree.js')
const ptt = require('../lib/index.js')
const { cachedHashMap } = require('../lib/util.js')


describe("Basic Usage", function() {


    describe("Class" , function testClass() {

        it("ptt usage", function () {

            const m = ptt({
                '/api/blog/:id': 2
            })

            expect(m.find('/api/blog/1').marker).to.equal(2);
        })
        it('route config in initialize', ()=>{

            const m = new Tree({
                '/api/blog/:id': 2
            })

            expect(m.find('/api/blog/1').marker).to.equal(2);
            expect(m.find('/api')).to.equal(null);

        }) 

    })

    describe("Static", function() {

        it("staticRoute", function() {

            const m = new Tree;
            m.add('/api/blog', 1);

            expect(m.find('/api/blog').marker).to.equal(1);

            expect(m.find('/api')).to.equal(null);

        })

        it("staticRoute with end === false", function() {


            const m = new Tree;

            m.add('/api/blog', 1,{
                end: false
            });


            expect(m.find('/api/blog/page').marker).to.equal(1);
            expect(m.find('/api')).to.equal(null);

            m.add('/api/blog/page', 2, {
                end: false
            });

            expect(m.find('/api/blog/page').marker).to.equal(2);

        })

        it("duplicated path", function() {
            const m = new Tree;
            m.add('/api/blog', 1);

            expect(function() {
                m.add('/api/blog', 2);
            }).to.throwError();

        })


        it("staticRoute with subPath", function() {

            const m = new Tree;

            m.add('/api/blog/tags',1);
            expect(m.find('/api/blog')).to.be.eql(null);

            m.add('/api/blog', 2)
            expect(m.find('/api/blog').marker).to.be.eql(2);
        })
    })

    describe("Dynamic", function() {

        it("dynamicRoute", function() {

            const m = new Tree;
            m.add('/api/blog/:id',  1 );
            expect(m.find('/api/blog/2').param).to.be.eql({
                id: "2"
            });
            expect(m.find('/api/blog/abc_2').param).to.be.eql({
                id: "abc_2"
            });
        })

        it("UpperCase ", function() {

            const m = new Tree;
            m.add('/API/:ID', 1);
            expect(m.find('/API/2').param.ID).to.be.equal("2");
            expect(m.find('/api/2')).to.be.eql(null);
        })

        it("dynamicRoute with subPath", function() {

            const m = new Tree;
            m.add('/api/blog/:id', 1);
            expect(m.find('/api/blog')).to.be.eql(null);

            m.add('/api/blog', 2)
            expect(m.find('/api/blog').marker).to.be.eql(2);
        })

        it("duplicated name", function() {
            const m = new Tree;
            m.add('/api/:id',  1);

            expect(function() {

                m.add('/api/:bid', 2);

            }).to.throwError();

        })

        it("duplicated path", function() {
            const m = new Tree;
            m.add('/api/:id', 1);

            expect(function() {

                m.add('/api/:id', 2);

            }).to.throwError();

        })


        it("lead optional", function() {

            const m = new Tree;

            m.add('/api/:id?', 1 );

            expect( m.find('/api/').marker ).to.equal( 1 );


            m.add('/blog/:id?-hello', 2 );

            expect( m.find('/blog/-hello').marker ).to.equal( 2 );


            // anonymous
            m.add('/user/(hello|hate)?-world', 3 );

            expect( m.find('/user/-world').marker ).to.equal( 3 );

        })

        it("lead optional with strict === false, static parent", function () {
            

            const m = new Tree;

            m.add('/api/:id?', 1 , {strict: false});

            expect( m.find('/api/world').param ).to.eql( {id: "world"} );
            expect( m.find('/api/').marker ).to.equal( 1 );
            expect( m.find('/api').marker ).to.equal( 1 );


            // normal case 
            m.add('/blog/:id?-world', 3 , {strict: false, end: false});

            expect( m.find('/blog/-world/').marker ).to.equal( 3 );
            expect( m.find('/blog/-world').marker ).to.equal( 3 );
            expect( m.find('/blog/-worlda') ).to.equal( null );
            expect( m.find('/blog/-world/a').marker ).to.equal( 3 );
        })

        it("lead optional with strict === false, dynamic parent", function () {

            const m = new Tree;

            m.add('/:name/:id?', 1 , {strict: false});

            expect( m.find('/cat/world').param ).to.eql( {id: "world", name: "cat"} );
            expect( m.find('/cat/').marker ).to.equal( 1 );
            expect( m.find('/cat').marker ).to.equal( 1 );

            // with end === false

        })




    })



    describe("Parameter", function() {

        it("anonymous capture", function() {

            const m = new Tree;

            m.add('/blog/(page|name)', 1);

            expect(m.find('/blog/page').param).to.eql({
                0: 'page'
            })


        })
        it("multiple param", function() {

            const m = new Tree;

            m.add('/blog/:id/tags/:tid', 1 );

            expect(m.find('/blog/1/tags/hello'))


        })

        it("whitespace capture", function() {
            const m = new Tree;

            m.add('/tags/:id([\\w ]+)', 1 );

            expect(m.find('/tags/hello world').param).to.eql({
                id: 'hello world'
            })
        })

        it("capture with sub capture", function() {

            const m = new Tree;

            m.add('/tags/:name-:id((hello|nice)?-world)', 1 );

            expect(m.find('/tags/any-hello-world').param).to.eql({
                name: 'any',
                id: 'hello-world'
            })

            m.add('/blog/dada-((?:hello|nice)?-world)',  2 );

            expect(m.find('/blog/dada-hello-world').param).to.eql({
                0: 'hello-world'
            })

        })

        
    })

    describe("Util", function() {
        it("util cachedHashMap", function() {
            let cache = cachedHashMap({
                limit: 10
            });

            for (var i = 0; i < 12; i++) {
                cache.set(i, i);
            }
            expect(cache.get('0')).to.equal(undefined)

            cache = cachedHashMap();
            for (var i = 0; i < 102; i++) {
                cache.set(i, i);
            }
            expect(cache.get('0')).to.equal(undefined)

        })
    })





    describe("Error Boundary", function() {
        it("same param", function() {
            expect(function() {
                new Tree().add('/api/:id/blog/:id', {});
            }).to.throwException(/Conflict/);
        })
    })

    describe("Option", function() {

        it("strict false with lead optional", function() {

            const m = new Tree;

            m.add('/tags/:name-:id((hello|nice)?-world)', 1 );


        })

    })



})