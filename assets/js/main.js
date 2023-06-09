// For the layout
var MINLENGTH = 169; // this controls the minimum length of any swimlane
var MINBREADTH = 100; // this controls the minimum breadth of any non-collapsed swimlane

// some shared functions

// this is called after nodes have been moved
function relayoutDiagram() {
  myDiagram.selection.each(function (n) {
    n.invalidateLayout();
  });
  myDiagram.layoutDiagram();
}

// compute the minimum size of the whole diagram needed to hold all of the Lane Groups
function computeMinPoolSize() {
  var len = MINLENGTH;
  myDiagram.findTopLevelGroups().each(function (lane) {
    var holder = lane.placeholder;
    if (holder !== null) {
      var sz = holder.actualBounds;
      len = Math.max(len, sz.height);
    }
    // var box = lane.selectionObject;
    // // naturalBounds instead of actualBounds to disregard the shape's stroke width
    // len = Math.max(len, box.naturalBounds.height);
  });
  return new go.Size(NaN, len);
}

// compute the minimum size for a particular Lane Group
function computeLaneSize(lane) {
  // assert(lane instanceof go.Group);
  var sz = computeMinLaneSize(lane);
  if (lane.isSubGraphExpanded) {
    var holder = lane.placeholder;
    if (holder !== null) {
      var hsz = holder.actualBounds;
      sz.width = Math.max(sz.width, hsz.width);
    }
  }
  // minimum breadth needs to be big enough to hold the header
  var hdr = lane.findObject("HEADER");
  if (hdr !== null) sz.width = Math.max(sz.width, hdr.actualBounds.width);
  return sz;
}

// determine the minimum size of a Lane Group, even if collapsed
function computeMinLaneSize(lane) {
  if (!lane.isSubGraphExpanded) return new go.Size(1, MINLENGTH);
  return new go.Size(MINBREADTH, MINLENGTH);
}


// define a custom grid layout that makes sure the length of each lane is the same
// and that each lane is broad enough to hold its subgraph
function PoolLayout() {
  go.GridLayout.call(this);
  this.cellSize = new go.Size(1, 1);
  this.wrappingColumn = Infinity;
  this.wrappingWidth = Infinity;
  this.spacing = new go.Size(0, 0);
  this.alignment = go.GridLayout.Position;
}
go.Diagram.inherit(PoolLayout, go.GridLayout);

/** @override */
PoolLayout.prototype.doLayout = function (coll) {
  var diagram = this.diagram;
  if (diagram === null) return;
  diagram.startTransaction("PoolLayout");
  // make sure all of the Group Shapes are big enough
  var minsize = computeMinPoolSize();
  diagram.findTopLevelGroups().each(function (lane) {
    if (!(lane instanceof go.Group)) return;
    var shape = lane.selectionObject;
    if (shape !== null) { // change the desiredSize to be big enough in both directions
      var sz = computeLaneSize(lane);
      shape.width = (!isNaN(shape.width)) ? Math.max(shape.width, sz.width) : sz.width;

      shape.height = minsize.height;
      var cell = lane.resizeCellSize;
      if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
      if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
    }
  });
  // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
  go.GridLayout.prototype.doLayout.call(this, coll);
  diagram.commitTransaction("PoolLayout");
};
// end PoolLayout class
function actualizarcursos() {
  for (let i = 2; i <= 10; i = i + 2) {
    document.getElementById("a" + (i / 2)).innerHTML = parseInt(document.getElementById("semestre" + i).innerHTML) + parseInt(document.getElementById("semestre" + (i - 1)).innerHTML);
    document.getElementById("ahp" + (i / 2)).innerHTML = parseInt(document.getElementById("hp" + i).innerHTML) + parseInt(document.getElementById("hp" + (i - 1)).innerHTML);
    document.getElementById("aht" + (i / 2)).innerHTML = parseInt(document.getElementById("ht" + i).innerHTML) + parseInt(document.getElementById("ht" + (i - 1)).innerHTML);
  }
}

function init() {
  if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
  var $ = go.GraphObject.make;

  myDiagram =
    $(go.Diagram, "myDiagramDiv", {
      // start everything in the middle of the viewport
      contentAlignment: go.Spot.Center,
      // use a simple layout to stack the top-level Groups next to each other
      layout: $(PoolLayout),
      // disallow nodes to be dragged to the diagram's background
      mouseDrop: function (e) {
        e.diagram.currentTool.doCancel();
      },
      // a clipboard copied node is pasted into the original node's group (i.e. lane).
      "commandHandler.copiesGroupKey": true,
      // automatically re-layout the swim lanes after dragging the selection
      "SelectionMoved": relayoutDiagram, // this DiagramEvent listener is
      "SelectionCopied": relayoutDiagram, // defined above
      "linkingTool.isEnabled": false, // invoked explicitly by drawLink function, below
      // "linkingTool.direction": go.LinkingTool.ForwardsOnly, // only draw "from" towards "to"
      "ModelChanged": function (e, obj) {
        if (e.isTransactionFinished) {
          let area = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
          for (let i = 1; i <= 10; i++) {
            let id = "semestre" + i;
            let group = myDiagram.findNodeForKey(id);
            if (group !== null) {
              let hp = ht = 0;
              group.memberParts.each(function (node) {
                hp += node.data.HP;
                ht += node.data.HT;
                area[node.data.color][0] += 1;
                area[node.data.color][1] += node.data.HP;
                area[node.data.color][2] += node.data.HT;
                area[node.data.color][3] += node.data.HP + node.data.HT;
              });
              let hs = hp + ht;
              let hts = hs * 16;
              document.getElementById(id).innerHTML = group.memberParts.count;
              document.getElementById("hp" + i).innerHTML = hp;
              document.getElementById("ht" + i).innerHTML = ht;
              document.getElementById("hs" + i).innerHTML = hs;
              document.getElementById("hts" + i).innerHTML = hts;

              actualizarcursos();
            }
          }
          var areatabla = document.getElementById("area");
          for (var i = 1; i < areatabla.rows.length; i++) {
            for (var j = 1; j < areatabla.rows[i].cells.length; j++) {
              areatabla.rows[i].cells[j].innerHTML = area[j - 1][i - 1];
            }
          }

          // this records each Transaction as a JSON-format string
          // showIncremental(myDiagram.model.toIncrementalJson(e));
        }
      },

      "animationManager.isEnabled": false,
      "undoManager.isEnabled": true,
    });
  //Habilitar boton de guardado
  myDiagram.addDiagramListener("Modified", function (e) {
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    var idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });


  // Customize the dragging tool:
  // When dragging a Node set its opacity to 0.7 and move it to the foreground layer
  myDiagram.toolManager.draggingTool.doActivate = function () {
    go.DraggingTool.prototype.doActivate.call(this);
    this.currentPart.opacity = 0.7;
    this.currentPart.layerName = "Foreground";
  }
  myDiagram.toolManager.draggingTool.doDeactivate = function () {
    this.currentPart.opacity = 1;
    this.currentPart.layerName = "";
    go.DraggingTool.prototype.doDeactivate.call(this);
  }


  // ------------------------------------------ NODE ------------------------------------------------

  // There are only three note colors by default, blue, red, and yellow but you could add more here:
  var noteColors = ['#ce6925', '#ffdf71', '#3aa6dd', '#7ab648', '#b391b5'];

  // change node color
  function getNoteColor(num) {
    return noteColors[Math.min(num, noteColors.length - 1)];
  }

  //crea la figura más redondeada
  go.Shape.defineFigureGenerator("RoundedAllRectangle", function (shape, w, h) {
    // this figure takes one parameter, the size of the corner
    var p1 = 50; // default corner size
    if (shape !== null) {
      var param1 = shape.parameter1;
      if (!isNaN(param1) && param1 >= 0) p1 = param1; // can't be negative or NaN
    }
    p1 = Math.min(p1, w / 2);
    p1 = Math.min(p1, h / 2); // limit by whole height or by half height?
    var geo = new go.Geometry();
    // a single figure consisting of straight lines and quarter-circle arcs
    geo.add(new go.PathFigure(0, p1)
      .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
      .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
      .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
      .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
      .add(new go.PathSegment(go.PathSegment.Line, p1, h))
      .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
    // don't intersect with two top corners when used in an "Auto" Panel
    geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
    geo.spot2 = new go.Spot(1, 1, -0.3 * p1, -0.3 * p1);
    return geo
  });
  myDiagram.nodeTemplate =
    $(go.Node, "Horizontal",
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

      {
        /*--------------Efecctos tridimenecional---------------*/
        isShadowed: true,
        shadowOffset: new go.Point(-4, 8),
        shadowColor: "#757575"
        /*-----------------------------------------------------*/
      },
      $(go.Panel, "Auto",
        $(go.Shape, "RoundedAllRectangle", {
          fill: "#ce6925",
          stroke: '#CCCCCC',
          portId: "",
          cursor: "pointer",
          fromLinkable: true,
          toLinkable: true,
          fromSpot: go.Spot.Right,
          toSpot: go.Spot.Left,
        },
          new go.Binding("fill", "color", getNoteColor),
          new go.Binding("stroke", "color", getNoteColor),
        ),
        $(go.Panel, "Table", {
          width: 130,
          minSize: new go.Size(NaN, 50)
        },
          $(go.TextBlock, {
            name: 'TEXT',
            margin: 6,
            font: '11px Lato, sans-serif',
            editable: true,
            isMultiline: false, // don't allow newlines in text
            stroke: "#000",
            maxSize: new go.Size(130, NaN),
            alignment: go.Spot.Center
          },
            new go.Binding("text", "text").makeTwoWay())
        )
      ),
    );
  myDiagram.nodeTemplate.selectionAdornmentTemplate =
    $(go.Adornment, "Spot",
      $(go.Panel, "Auto",
        $(go.Shape, {
          stroke: "dodgerblue",
          strokeWidth: 2,
          fill: null
        }),
        $(go.Placeholder)
      ),
      $(go.Panel, "Horizontal", {
        alignment: go.Spot.Top,
        alignmentFocus: go.Spot.Bottom
      },
        $("Button", {
          click: editText
        }, // defined below, to support editing the text of the node
          $(go.TextBlock, "t", {
            font: "bold 10pt sans-serif",
            desiredSize: new go.Size(15, 15),
            textAlign: "center"
          })
        ),
        $("Button", {
          click: changeColor,
          // "_buttonFillOver": "transparent"
        }, // defined below, to support changing the color of the node
          new go.Binding("ButtonBorder.fill", "color", getNoteColor),
          $(go.Shape, {
            fill: null,
            stroke: null,
            desiredSize: new go.Size(14, 14)
          })
        ),
        $("Button", { // drawLink is defined below, to support interactively drawing new links
          click: drawLink, // click on Button and then click on target node
          actionMove: drawLink // drag from Button to the target node
        },
          $(go.Shape, {
            geometryString: "M0 0 L8 0 8 12 14 12 M12 10 L14 12 12 14"
          })
        ),
        $("Button", {
          click: function (e, obj) {
            var node = obj.part.adornedPart;
            if (node !== null) {
              myDiagram.startTransaction("remove");
              myDiagram.commandHandler.deleteSelection(node.data);
              myDiagram.commitTransaction("remove");
            }
          }
        },
          $(go.TextBlock, "X", {
            font: "bold 10pt sans-serif",
            desiredSize: new go.Size(15, 15),
            textAlign: "center"
          })
        ),
        $(go.TextBlock, "TP:", {
          font: "10pt Verdana, sans-serif",
          textAlign: "right",
          margin: 2,
          wrap: go.TextBlock.None,
          width: 25,
        }),
        $(go.TextBlock, {
          name: "TP",
          margin: 2,
          textValidation: isValidCount,
          text: "OB"
        },
        ),
        $("Button", {
          click: typeSelect
        },
          $(go.Shape, "Triangle", {
            margin: 3,
            desiredSize: new go.Size(7, 7)
          })
        ),
      ),

      $(go.Panel, "Horizontal", {
        alignment: go.Spot.Bottom,
        alignmentFocus: go.Spot.Top
      },
        $(go.Panel, "Horizontal", {
          column: 4
        },
          $(go.TextBlock, "HP:", {
            font: "10pt Verdana, sans-serif",
            textAlign: "right",
            margin: 2,
            wrap: go.TextBlock.None,
            width: 25,
          }),
          $(go.TextBlock, {
            name: "HP",
            margin: 2,
            textValidation: isValidCount
          },
            new go.Binding("text", "HP").makeTwoWay(function (count) {
              return parseInt(count, 10);
            })),
          $("Button", {
            click: incrementHP
          },
            $(go.Shape, "PlusLine", {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          ),
          $("Button", {
            click: decrementHP
          },
            $(go.Shape, "MinusLine", {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          )
        ),
        $(go.Panel, "Horizontal", {
          column: 3
        },
          $(go.TextBlock, "HT:", {
            font: "10pt Verdana, sans-serif",
            textAlign: "right",
            margin: 2,
            wrap: go.TextBlock.None,
            width: 25,
          }),
          $(go.TextBlock, {
            name: "HT",
            margin: 2,
            textValidation: isValidCount
          }, new go.Binding("text", "HT").makeTwoWay(function (count) {
            return parseInt(count, 10);
          })),
          $("Button", {
            click: incrementHT
          },
            $(go.Shape, "PlusLine", {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          ),
          $("Button", {
            click: decrementHT
          },
            $(go.Shape, "MinusLine", {
              margin: 3,
              desiredSize: new go.Size(7, 7)
            })
          )
        )
      )
    );
  // When user hits + button, increment count on that option
  function incrementHP(e, obj) {
    let node = obj.part.data;
    if (node !== null) {
      myDiagram.model.startTransaction("increment count");
      myDiagram.model.setDataProperty(node, "HP", node.HP + 1);
      obj.part.findObject("HP").text = node.HP;
      myDiagram.model.commitTransaction("increment count");
    }
  }

  /* -----------------------Agregado de tipos en nodos---------------------------------- */
  var tipos = ['OB', 'OBC'];
  var tipoIndex = 0; // El índice inicial es 0 (primer tipo en la lista)


  function typeSelect(e, obj) {
    let node = obj.part.data;
    if (node !== null) {
      myDiagram.model.startTransaction("change type");
      tipoIndex = (tipoIndex + 1) % tipos.length; // Avanzar al siguiente tipo en la lista (circularmente)
      let nuevoTipo = tipos[tipoIndex];
      myDiagram.model.setDataProperty(node, "tipo", nuevoTipo);
      obj.part.findObject("TP").text = node.tipo;
      myDiagram.model.commitTransaction("change type");
    }
  }
  /* --------------------------------------------------------------------------------------- */


  function incrementHT(e, obj) {
    let node = obj.part.data;
    if (node !== null) {
      myDiagram.model.startTransaction("increment count");
      myDiagram.model.setDataProperty(node, "HT", node.HT + 1);
      obj.part.findObject("HT").text = node.HT;
      myDiagram.model.commitTransaction("increment count");
    }
  }
  // When user hits - button, decrement count on that option
  function decrementHP(e, obj) {
    let node = obj.part.data;
    if (node !== null) {
      myDiagram.model.startTransaction("decrement count");
      if (node.HP > 1)
        myDiagram.model.setDataProperty(node, "HP", node.HP - 1);
      obj.part.findObject("HP").text = node.HP;
      myDiagram.model.commitTransaction("decrement count");
    }
  }

  function decrementHT(e, obj) {
    let node = obj.part.data;
    if (node !== null) {
      myDiagram.model.startTransaction("decrement count");
      if (node.HT > 1)
        myDiagram.model.setDataProperty(node, "HT", node.HT - 1);
      obj.part.findObject("HT").text = node.HT;
      myDiagram.model.commitTransaction("decrement count");
    }
  }
  // Validation function for editing text
  function isValidCount(textblock, oldstr, newstr) {
    if (newstr === "") return false;
    var num = +newstr; // quick way to convert a string to a number
    return !isNaN(num) && Number.isInteger(num) && num >= 0;
  }

  function editText(e, button) {
    var node = button.part.adornedPart;
    e.diagram.commandHandler.editTextBlock(node.findObject("TEXTBLOCK"));
  }

  function changeColor(e, obj) {
    myDiagram.startTransaction("Update node color");
    var newColor = parseInt(obj.part.data.color) + 1;
    if (newColor > noteColors.length - 1) newColor = 0;
    myDiagram.model.setDataProperty(obj.part.data, "color", newColor);
    //obj["_buttonFillNormal"] = getNoteColor(newColor); // uncomment to update the button too
    myDiagram.commitTransaction("Update node color");
  }


  function drawLink(e, button) {
    var node = button.part.adornedPart;
    var tool = e.diagram.toolManager.linkingTool;
    tool.startObject = node.port;
    e.diagram.currentTool = tool;
    tool.doActivate();
  }


  // --------------------------------------------------------- LINK --------------------------------------------------------------

  myDiagram.linkTemplate =
    $(go.Link, // the whole link panel
      {
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        resegmentable: true
      }, {
      routing: go.Link.AvoidsNodes, // but this is changed to go.Link.Orthgonal when the Link is reshaped
      adjusting: go.Link.End,
      curve: go.Link.JumpOver,
      corner: 15,
      toShortLength: 4
    },
      new go.Binding("points").makeTwoWay(),
      // remember the Link.routing too
      new go.Binding("routing", "routing", go.Binding.parseEnum(go.Link, go.Link.AvoidsNodes))
        .makeTwoWay(go.Binding.toString),
      $(go.Shape, // the link path shape
        {
          isPanelMain: true,
          strokeWidth: 2
        }),
      $(go.Shape, // the arrowhead
        {
          toArrow: "Standard",
          stroke: null
        })
    );

  // permitir enlazar solo a materias de semestres posteriores
  function correlatividadenlace(fromnode, fromport, tonode, toport) {
    return parseInt(fromnode.data.group.substr(8)) < parseInt(tonode.data.group.substr(8));
  }

  // only allow new links between ports
  myDiagram.toolManager.linkingTool.linkValidation = correlatividadenlace;

  // only allow reconnecting an existing link to a port
  myDiagram.toolManager.relinkingTool.linkValidation = correlatividadenlace;

  // ----------------------------------------------------- Group -------------------------------------------------------------

  // updateLinks on expand
  function updateCrossLaneLinks(group) {
    group.findExternalLinksConnected().each(function (l) {
      l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
    });
  }
  // While dragging, highlight the dragged-over group
  function highlightGroup(grp, show) {
    if (show) {
      var part = myDiagram.toolManager.draggingTool.currentPart;
      if (part.containingGroup !== grp) {
        grp.isHighlighted = true;
        return;
      }
    }
    grp.isHighlighted = false;
  }

  function groupStyle() { // common settings for both Lane and Pool Groups
    return [{
      layerName: "Background", // all pools and lanes are always behind all nodes and links
      background: "transparent", // can grab anywhere in bounds
      copyable: false, // can't copy lanes or pools
      avoidable: false, // don't impede AvoidsNodes routed Links
      selectable: false,
      click: function (e, grp) { // allow simple click on group to clear selection
        if (!e.shift && !e.control && !e.meta) e.diagram.clearSelection();
      }
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
    ];
  }

  function correlatividadgrupo(group, node) {
    if (group === null) return true; // when maybe dropping a node in the background
    if (node instanceof go.Group) return false; // don't add Groups to Groups
    let nodebeforeiterator = node.findNodesInto();
    let nodeafteriterator = node.findNodesOutOf();
    let nodebefore = 0,
      nodeafter = 11;
    while (nodebeforeiterator.next()) {
      let i = parseInt(nodebeforeiterator.value.data.group.substr(8));
      if (i > nodebefore) {
        nodebefore = i
      }
    }
    while (nodeafteriterator.next()) {
      let i = parseInt(nodeafteriterator.value.data.group.substr(8));
      if (i < nodeafter) {
        nodeafter = i
      }
    }
    let groupid = parseInt(group.data.key.substr(8));
    return groupid > nodebefore && groupid < nodeafter;
  };

  myDiagram.groupTemplate =
    $(go.Group, "Vertical", groupStyle(), {
      selectionObjectName: "SHAPE", // even though its not selectable, this is used in the layout
      layout: $(go.GridLayout, // automatically lay out the lane's subgraph
        {
          wrappingColumn: 1,
          cellSize: new go.Size(1, 1),
          spacing: new go.Size(5, 20),
          alignment: go.GridLayout.Position,
          comparer: function (a, b) { // can re-order tasks within a lane
            var ay = a.location.y;
            var by = b.location.y;
            if (isNaN(ay) || isNaN(by)) return 0;
            if (ay < by) return -1;
            if (ay > by) return 1;
            return 0;
          }
        }),
      computesBoundsAfterDrag: true, // needed to prevent recomputing Group.placeholder bounds too soon
      handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links

      memberValidation: correlatividadgrupo,
      // support highlighting of Groups when allowing a drop to add a member
      mouseDragEnter: function (e, grp, prev) {
        // this will call samePrefix; it is true if any node has the same key prefix
        if (grp.canAddMembers(grp.diagram.selection)) {
          highlightGroup(grp, true);
          grp.diagram.currentCursor = "";
        } else {
          grp.diagram.currentCursor = "not-allowed";
        }
      },
      mouseDragLeave: function (e, grp, next) {
        highlightGroup(grp, false);
        grp.diagram.currentCursor = "";
      },
      mouseDrop: function (e, grp) {
        if (grp.canAddMembers(grp.diagram.selection)) {
          // this will only add nodes with the same key prefix
          grp.addMembers(grp.diagram.selection, true);
          updateCrossLaneLinks(grp);
        } else { // and otherwise cancel the drop
          grp.diagram.currentTool.doCancel();
        }
      },
      subGraphExpandedChanged: function (grp) {
        var shp = grp.selectionObject;
        if (grp.diagram.undoManager.isUndoingRedoing) return;
        if (grp.isSubGraphExpanded) {
          shp.width = grp._savedBreadth;
        } else {
          grp._savedBreadth = shp.width;
          shp.width = NaN;
        }
        updateCrossLaneLinks(grp);
      },
      doubleClick: function (e, grp) {
        myDiagram.startTransaction('add node');
        var newdata = {
          group: grp.key,
          // loc: "0 50",
          text: "materia",
          color: 0,
          HP: 1,
          HT: 1,
          tipo: "OB"
        };
        myDiagram.model.addNodeData(newdata);
        myDiagram.commitTransaction('add node');
        var node = myDiagram.findNodeForData(newdata);
        myDiagram.select(node);
        myDiagram.commandHandler.editTextBlock();
      }
    },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
      // the lane header consisting of a TextBlock and an expander button
      $(go.Panel, "Horizontal", {
        name: "HEADER",
        angle: 0, // maybe rotate the header to read sideways going up
        alignment: go.Spot.Center
      },
        $("SubGraphExpanderButton", {
          margin: 15,
          "_subGraphExpandedFigure": "TriangleUp",
          "_subGraphCollapsedFigure": "TriangleDown",
          "_buttonFillOver": "lightgreen",
          "_buttonStrokeOver": "green",
          //visible: false

        }), // this remains always visible
        $(go.Panel, "Horizontal", // this is hidden when the swimlane is collapsed
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          $(go.TextBlock, // the lane label
            {
              font: "15px Lato, sans-serif",
              editable: true,
              margin: new go.Margin(2, 0, 0, 0)
            },
            new go.Binding("text", "text").makeTwoWay())
        )
      ),
      // END Horizontal Panel
      $(go.Panel, "Auto", // the lane consisting of a background Shape and a Placeholder representing the subgraph
        $(go.Shape, "Rectangle", // this is the resized object
          {
            name: "SHAPE",
            stroke: "#F1F1F1",//Color de paneles
            strokeWidth: 1
          },
          new go.Binding("fill", "isHighlighted", function (h) {
            return h ? "#D6D6D6" : "#ffffff";
          }).ofObject(),
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
        $(go.Placeholder, {
          padding: 40,
          alignment: go.Spot.TopLeft
        }),
        $(go.TextBlock, // this TextBlock is only seen when the swimlane is collapsed
          {
            name: "LABEL",
            font: "15px Lato, sans-serif",
            editable: true,
            angle: 90,
            alignment: go.Spot.TopLeft,
            margin: new go.Margin(4, 0, 0, 2)
          },
          new go.Binding("visible", "isSubGraphExpanded", function (e) {
            return !e;
          }).ofObject(),
          new go.Binding("text", "text").makeTwoWay())
      ) // end Auto Panel
    ); // end Group
  // myDiagram.groupTemplate.addChangedListener(function(e, grp){
  //   console.log(grp);
  // });
  // ------------------------------------------ EXTRA INFORMATIONS ------------------------------------------------

  myDiagram.add(
    $(go.Part, "Table", {
      selectable: false,
      alignment: go.Spot.Center

    },
      $(go.TextBlock, "Areas", {
        row: 0,
        font: "700 14px Droid Serif, sans-serif",
      }), // end row 0
      $(go.Panel, "Horizontal", {
        row: 1,
        alignment: go.Spot.Left

      },
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(10, 10),
          fill: getNoteColor(0),
          margin: 5
        }),
        $(go.TextBlock, "Ciencias de la Computación", {
          font: "700 13px Droid Serif, sans-serif",
        }),
      ), // end row 1
      $(go.Panel, "Horizontal", {
        row: 2,
        alignment: go.Spot.Left
      },
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(10, 10),
          fill: getNoteColor(1),
          margin: 5
        }),
        $(go.TextBlock, "Ciencias Matemáticas y Físicas", {
          font: "700 13px Droid Serif, sans-serif"
        })
      ), // end row 2
      $(go.Panel, "Horizontal", {
        row: 3,
        alignment: go.Spot.Left
      },
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(10, 10),
          fill: getNoteColor(2),
          margin: 5
        }),
        $(go.TextBlock, "Tecnologías Aplicadas", {
          font: "700 13px Droid Serif, sans-serif"
        })
      ), // end row 3
      $(go.Panel, "Horizontal", {
        row: 4,
        alignment: go.Spot.Left
      },
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(10, 10),
          fill: getNoteColor(3),
          margin: 5
        }),
        $(go.TextBlock, "Complementarias", {
          font: "700 13px Droid Serif, sans-serif"
        })
      ), // end row 4
      $(go.Panel, "Horizontal", {
        row: 5,
        alignment: go.Spot.Left
      },
        $(go.Shape, "RoundedRectangle", {
          desiredSize: new go.Size(10, 10),
          fill: getNoteColor(4),
          margin: 5
        }),
        $(go.TextBlock, "Enfásis u orientación propio de la carrera", {
          font: "700 13px Droid Serif, sans-serif"
        })
      )
    ));


  // ------------------------------------------ MODEL ------------------------------------------------

  // define some sample graphs in some of the lanes
  myDiagram.model = new go.GraphLinksModel(
    [
      {
        key: "semestre1",
        isGroup: true,
      },
      {
        key: "semestre2",
        isGroup: true,
      },
      {
        key: "semestre3",
        isGroup: true,
      },
      {
        key: "semestre4",
        isGroup: true,
      },
      {
        key: "semestre5",
        isGroup: true,
      },
      {
        key: "semestre6",
        isGroup: true,
      },
      {
        key: "semestre7",
        isGroup: true,
      },
      {
        key: "semestre8",
        isGroup: true,
      },
      {
        key: "semestre9",
        isGroup: true,
      },
      {
        key: "semestre10",
        isGroup: true,
      },
    ],
    [ // link data

    ]);

} // end init



function showPrompt(op, id, nom) {
  Swal.fire({
    text: 'Escriba un nombre para el modelo',
    input: 'text',
    inputValue: nom || '',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    imageUrl: "./assets/img/Info.png",
    imageWidth: 400,
    imageHeight: 200,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: (nombre) => {
      if (!nombre) {
        Swal.showValidationMessage('Por favor, ingresa un nombre');
      }
      return { nombre: nombre };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const nombre = result.value.nombre;
      if (op === "modificar") {
        editModel(id, nombre)
      } else {
        saveAndInsert(nombre);
      }

    }
  });
}


function saveAndInsert(nombre) {
  var modelJson = myDiagram.model.toJson();
  var blobModel = new Blob([modelJson], { type: "application/json" });
  var blobImage = null;
  var blobCallback = function (blob) {
    blobImage = blob;
    var formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('imagen', blobImage);
    formData.append('modelos', blobModel);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', './assets/php/Insertar.php', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        Swal.fire({
          title: 'Éxito',
          text: 'Los datos se insertaron correctamente.',
          timer: 5000,
          timerProgressBar: true,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al insertar los datos en la base de datos.',
          timer: 5000,
          timerProgressBar: true,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };
    xhr.send(formData);
  };

  myDiagram.makeImageData({
    background: "white",
    scale: 1,
    returnType: "blob",
    callback: blobCallback
  });
}


function Listar() {
  fetch('./assets/php/listar.php')
    .then(response => response.json())
    .then(data => {

      htmlTable =
        '<table class="table table-bordered" border=1><thead><tr><th>Nombre</th><th>Imagen</th><th>Modelo</th></tr></thead><tbody>' +
        '<tr>' +
        (data || []).map((per) =>
          '<tr><td>' + per.nombre + '</td>' +
          '<td><a href="data:image/jpeg;base64,' + per.imagen + '" download="' + per.nombre + '.jpg"><i class="fa-solid fa-file-image"></i></a></td>' +
          '<td><a href="#" onclick="load(event, \'' + per.modelos + '\', \'' + per.nombre + '\', \'' + per.idmalla + '\')"><i class="fa-solid fa-file-code"></i></a></td>' +
          '<td><a href="#" onclick="eliminarMalla(event,\'' + per.idmalla + '\')"><i class="fa-solid fa-trash"></i></a></td></tr>'
        ).join('') +
        '</tr></tbody></table>';

      Swal.fire({
        title: "Lista de modelos",
        text: "Elige un modelo",
        html: htmlTable,
        imageUrl: "./assets/img/list2.png",
        imageWidth: 400,
        imageHeight: 200,
      });
    })
    .catch(error => {
      console.error('Error al obtener los datos:', error);
    });
}

function eliminarMalla(event, idmalla) {
  event.preventDefault(); // Evita el comportamiento predeterminado del enlace

  Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esta acción",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append('idmalla', idmalla); // Agrega el valor de idmalla al FormData

      fetch('./assets/php/eliminar.php', {
        method: 'POST',
        body: formData, // Envia el FormData en el cuerpo de la solicitud
      })
        .then(response => response.text())
        .then(result => {
          Swal.fire({
            title: 'Éxito',
            text: 'Los datos se eliminaron correctamente.',
            timer: 5000,
            timerProgressBar: true,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al eliminar la malla:', error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al eliminar los datos en la base de datos.',
            timer: 5000,
            timerProgressBar: true,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  });
}


function load(event, modelos, nombre, idmalla) {
  event.preventDefault();
  var savedModel = atob(modelos);

  if (savedModel) {
    myDiagram.model = go.Model.fromJson(savedModel);
    Swal.fire({
      title: 'Éxito',
      text: 'El modelo se ha cargado correctamente.',
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      confirmButtonText: 'Aceptar'
    });
    myDiagram.layoutDiagram(true);
    // Cambiar el evento onclick y el texto del botón
    var saveButton = document.getElementById('SaveButton');
    saveButton.onclick = function () {

      Swal.fire({
        title: 'Opciones',
        text: 'Selecciona una opción',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Modificar',
        cancelButtonText: 'Guardar'
      }).then((result) => {
        if (result.isConfirmed) {
          showPrompt("modificar", idmalla, nombre)
        } else {
          showPrompt("guardar")
        }
      });

    };
    saveButton.textContent = 'Opciones';
  } else {
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al cargar el modelo.',
      icon: 'error',
      timer: 5000,
      timerProgressBar: true,
      confirmButtonText: 'Aceptar'
    });
  }
}

function editModel(id, nombre) {
  var modelJson = myDiagram.model.toJson();
  var blobModel = new Blob([modelJson], { type: "application/json" });
  var blobImage = null;
  var blobCallback = function (blob) {
    blobImage = blob;
    var formData = new FormData();
    formData.append('id', id);
    formData.append('nombre', nombre);
    formData.append('imagen', blobImage);
    formData.append('modelos', blobModel);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', './assets/php/Modificar.php', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        Swal.fire({
          title: 'Éxito',
          text: 'Los datos se actualizaron correctamente.',
          timer: 5000,
          timerProgressBar: true,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al actualizar los datos en la base de datos.',
          timer: 5000,
          timerProgressBar: true,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };
    xhr.send(formData);
  };

  myDiagram.makeImageData({
    background: "white",
    scale: 1,
    returnType: "blob",
    callback: blobCallback
  });
}
