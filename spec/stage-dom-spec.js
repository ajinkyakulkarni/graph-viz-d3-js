define(["stage", 'transformer', 'spec/shapes/graph-label', 'spec/shapes/courier-fonts', 'spec/jasmine/image-matchers', 'resemble',
  ], function (stage, transformer, graphLabelShapes, courierFontsShapes, imageMatchers, resemble) {

  function shortcircut(selection, attributes) {
    selection.call(attributes);
  }

  var immediate = {
    document: shortcircut,
    canvas: shortcircut,
    nodes: shortcircut,
    relations: shortcircut,
    exits: shortcircut,
    shapes: shortcircut,
    labels: shortcircut
  };

  describe("Stage", function() {

    beforeEach(function() {
      var fixture = '<div id="graph"></div>';
      document.body.insertAdjacentHTML(
        'afterbegin',
        fixture);

      stage.transitions(immediate);
    });

    afterEach(function() {
      document.body.removeChild(document.getElementById('graph'));
    });

    describe("generated SVG", function() {
      beforeEach(function() {
        stage.init("#graph");
      });

      it("should contain label", function() {
        stage.draw(graphLabelShapes);
        expect(document.querySelector("#graph svg > g > g > text").textContent).toEqual("Graph");
      });

      it("should render non default fonts properly", function() {
        stage.draw(courierFontsShapes);
        expect(document.querySelector('#graph svg text[style*="Courier"]').textContent).toEqual("Courier");
        expect(document.querySelector('#graph svg text[style*="Courier-Bold"]').textContent).toEqual("Courier-Bold");
        expect(document.querySelector('#graph svg text[style*="Courier-Oblique"]').textContent).toEqual("Courier-Oblique");
        expect(document.querySelector('#graph svg text[style*="Courier-BoldOblique"]').textContent).toEqual("Courier-BoldOblique");
        expect(document.querySelectorAll('#graph svg text[style*="stroke:"]').length).toEqual(0);
        expect(document.querySelectorAll('#graph svg text[style*="color:"]').length).toEqual(4);
        expect(document.querySelectorAll('#graph svg text[style*="font-size: 14px"]').length).toEqual(4);
      });
    });

    describe("export of PNG image when zoom available", function() {
      beforeEach(function() {
        stage.init({
          element: "#graph",
          zoom: true
        });
        jasmine.addMatchers(imageMatchers);
      });

      it("should return whole diagram when no zoom set", function(done) {
        var shapes = transformer.generate("digraph { A -> B -> C }");
        stage.draw(shapes);

        var actual = stage.getImage(false);
        var expected = new Image();
        expected.src = "/base/spec/img/A-B-C.png";

        actual.onload = function() {
          resemble(actual.src)
            .compareTo("/base/spec/img/A-B-C.png")
            .ignoreAntialiasing()
            .onComplete(function(data) {
              expect(actual).toImageEqual(expected, data, 1);
              done();
            });
        };
      });

      it("should return part of diagram when zoom is set", function(done) {
        var shapes = transformer.generate("digraph { A -> B -> C }");
        stage.draw(shapes);
        stage.setZoom({
          scale: 1.5,
          translate: [-10, 230]
        });

        var actual = stage.getImage();
        var expected = new Image();
        expected.src = "/base/spec/img/B-zoomed.png";

        actual.onload = function() {
          resemble(actual.src)
            .compareTo("/base/spec/img/B-zoomed.png")
            .ignoreAntialiasing()
            .onComplete(function(data) {
              expect(actual).toImageEqual(expected, data, 5);
              done();
            });
        };
      });
    });
  });
});