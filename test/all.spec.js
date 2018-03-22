const expect = require('expect.js');
const {
    Matcher
} = require('../src/index.js')

const {
    cachedHashMap
} = require('../src/util.js')


describe("Basic Usage", function() {

    describe("Static", function() {

        it("staticRoute", function() {

            const m = new Matcher;
            m.add('/api/blog', {
                marker: 1
            });

            expect(m.find('/api/blog').marker).to.equal(1);

            expect(m.find('/api')).to.equal(null);

        })

        it("staticRoute with end === false", function() {


            const m = new Matcher;

            m.add('/api/blog', {
                marker: 1,
                end: false
            });


            expect(m.find('/api/blog/page').marker).to.equal(1);
            expect(m.find('/api')).to.equal(null);

            m.add('/api/blog/page', {
                marker: 2,
                end: false
            });

            expect(m.find('/api/blog/page').marker).to.equal(2);

        })

        it("duplicated path", function() {
            const m = new Matcher;
            m.add('/api/blog', {
                marker: 1
            });

            expect(function() {
                m.add('/api/blog', {
                    marker: 2
                });
            }).to.throwError();

        })


        it("staticRoute with subPath", function() {

            const m = new Matcher;

            m.add('/api/blog/tags', {
                marker: 1
            });
            expect(m.find('/api/blog')).to.be.eql(null);

            m.add('/api/blog', {
                marker: 2
            })
            expect(m.find('/api/blog').marker).to.be.eql(2);
        })
    })

    describe("Dynamic", function() {

        it("dynamicRoute", function() {

            const m = new Matcher;
            m.add('/api/blog/:id', {
                marker: 1
            });
            expect(m.find('/api/blog/2').param).to.be.eql({
                id: "2"
            });
            expect(m.find('/api/blog/abc_2').param).to.be.eql({
                id: "abc_2"
            });
        })

        it("UpperCase ", function() {

            const m = new Matcher;
            m.add('/API/:ID', {
                marker: 1
            });
            expect(m.find('/API/2').param.ID).to.be.equal("2");
            expect(m.find('/api/2')).to.be.eql(null);
        })

        it("dynamicRoute with subPath", function() {

            const m = new Matcher;
            m.add('/api/blog/:id', {
                marker: 1
            });
            expect(m.find('/api/blog')).to.be.eql(null);

            m.add('/api/blog', {
                marker: 2
            })
            expect(m.find('/api/blog').marker).to.be.eql(2);
        })

        it("duplicated name", function() {
            const m = new Matcher;
            m.add('/api/:id', {
                marker: 1
            });

            expect(function() {

                m.add('/api/:bid', {
                    marker: 2
                });

            }).to.throwError();

        })

        it("duplicated path", function() {
            const m = new Matcher;
            m.add('/api/:id', {
                marker: 1
            });

            expect(function() {

                m.add('/api/:id', {
                    marker: 2
                });

            }).to.throwError();

        })


        it("named optional", function() {

            const m = new Matcher;

            m.add('/api/:id?', {
                marker: 1
            });

        })

        it("anonymous optional", function() {

        })



    })



    describe("Parameter", function() {

        it("anonymous capture", function() {

            const m = new Matcher;

            m.add('/blog/(page|name)', {
                marker: 1
            });

            expect(m.find('/blog/page').param).to.eql({
                0: 'page'
            })


        })
        it("multiple param", function() {

            const m = new Matcher;

            m.add('/blog/:id/tags/:tid', {
                marker: 1
            });

            expect(m.find('/blog/1/tags/hello'))


        })

        it("whitespace capture", function() {
            const m = new Matcher;

            m.add('/tags/:id([\\w ]+)', {
                marker: 1
            });

            expect(m.find('/tags/hello world').param).to.eql({
                id: 'hello world'
            })
        })

        it("capture with sub capture", function() {

            const m = new Matcher;

            m.add('/tags/:name-:id((hello|nice)?-world)', {
                marker: 1
            });

            expect(m.find('/tags/any-hello-world').param).to.eql({
                name: 'any',
                id: 'hello-world'
            })

            m.add('/blog/dada-((?:hello|nice)?-world)', {
                marker: 2
            });

            expect(m.find('/blog/dada-hello-world').param).to.eql({
                0: 'hello-world'
            })

        })
        it("Optional param", function() {
            throw Error();
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
                new Matcher().add('/api/:id/blog/:id', {});
            }).to.throwException(/Conflict/);
        })
    })

    describe("Option", function() {

        it("strict false with lead optional", function(done) {

            const m = new Matcher;

            m.add('/tags/:name-:id((hello|nice)?-world)', {
                marker: 1
            });


        })

    })



})