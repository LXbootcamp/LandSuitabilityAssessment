import "./style.css";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style, Circle } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Map, Overlay, View } from "ol";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Select, Draw } from "ol/interaction.js";
import Feature from "ol/Feature.js";

var vectorLayer;
var vectorSource;
var vectorSource3;
var selectLayer;
let overlay;
var emdid = null;

const centers = {
  emd00: [14071801, 4158523],
  emd01: [14068894, 4163817],
  emd02: [14082805, 4153124],
  emd03: [14079690, 4162675],
  emd04: [14076834, 4141856],
  emd05: [14064836, 4156529],
  emd06: [14084049, 4140559],
  emd07: [14074240, 4153853],
  emd08: [14059486, 4177606],
  emd09: [14072457, 4169013],
};

const centers2 = {
  emd00: [14086748, 4154096],
  emd01: [14071824, 4165714],
  emd02: [14086748, 4154096],
  emd03: [14084063, 4165091],
  emd04: [14081935, 4142747],
  emd05: [14068863, 4158200],
  emd06: [14088420, 4142392],
  emd07: [14078743, 4155363],
  emd08: [14065164, 4181305],
  emd09: [14079972, 4170940],
};

// 초기 지도 중심과 확대 수준
const initialCenter = [14071801, 4158523];
const initialZoom = 11;

function makeFilter1(method) {
  let filter1 = "";

  if ("emd00" == method) filter1 = "a3 like '%무안군%'";
  else if ("emd01" == method) filter1 = "a3 like '%망운면%'";
  else if ("emd02" == method) filter1 = "a3 like '%몽탄면%'";
  else if ("emd03" == method) filter1 = "a3 like '%무안읍%'";
  else if ("emd04" == method) filter1 = "a3 like '%삼향읍%'";
  else if ("emd05" == method) filter1 = "a3 like '%운남면%'";
  else if ("emd06" == method) filter1 = "a3 like '%일로읍%'";
  else if ("emd07" == method) filter1 = "a3 like '%청계면%'";
  else if ("emd08" == method) filter1 = "a3 like '%해제면%'";
  else if ("emd09" == method) filter1 = "a3 like '%현경면%'";
  return filter1;
}

const vectorSource2 = new VectorSource({
  url: "http://localhost:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:muan_emd&&outputFormat=application/json",
  format: new GeoJSON(),
});

const vectorLayer2 = new VectorLayer({
  source: vectorSource2,
  style: new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.5)",
    }),
    stroke: new Stroke({
      color: "rgba(100, 100, 100, 1.0)",
      width: 2,
    }),
  }),
});

///////////////선택 지번 레이어에 대한 부분/////////////
function makeFilter(clickedFeatureJibun) {
  let filter = "jibun = '";
  filter += clickedFeatureJibun + "'";
  return filter;
}

function makeWFSSource2(clickedFeatureJibun) {
  vectorSource3 = new VectorSource({
    url: encodeURI(
      "http://localhost:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan&outputFormat=application/json&CQL_FILTER=" +
        makeFilter(clickedFeatureJibun)
    ),
    format: new GeoJSON(),
  });
  if (null != selectLayer) {
    selectLayer.setSource(vectorSource3);
    selectLayer.setVisible(true);
  }
}

selectLayer = new VectorLayer({
  source: null, // 초기에는 소스를 설정하지 않음
  visible: false, // 초기에는 보이지 않도록 설정
  style: new Style({
    fill: new Fill({
      color: "rgba(127, 0, 255, 1)",
    }),
    stroke: new Stroke({
      color: "rgba(76, 0, 153, 1)",
      width: 2,
    }),
  }),
});
////////////////////////////////////////////////////

function makeWFSSource(method) {
  vectorSource = new VectorSource({
    url: encodeURI(
      "http://localhost:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan&outputFormat=application/json&CQL_FILTER=" +
        makeFilter1(method)
    ),
    format: new GeoJSON(),
  });
  if (null != vectorLayer) {
    vectorLayer.setSource(vectorSource);
    vectorLayer.setVisible(true);
  }
  // 지도 중심 및 확대 수준 설정
  const view = map.getView();
  let zoomLevel = method === "emd00" ? 11 : 12.5; // 삼항함수 - emd00인 경우  zoomLevel을 11로 설정
  view.animate({
    center: centers[method],
    zoom: zoomLevel,
    duration: 1000, // 1초 동안 애니메이션
  });
}
//makeWFSSource("");

vectorLayer = new VectorLayer({
  source: null, // 초기에는 소스를 설정하지 않음
  visible: false, // 초기에는 보이지 않도록 설정
  style: new Style({
    stroke: new Stroke({
      color: "rgba(0, 153, 051, 1.0)",
      width: 2,
    }),
  }),
});

const raster = new Tile({
  source: new OSM({}),
});

const DrawSource = new VectorSource({ wrapX: false });

const DrawVector = new VectorLayer({
  source: DrawSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.5)",
    }),
    stroke: new Stroke({
      color: "#ffcc33",
      width: 2,
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: "#ffcc33",
      }),
    }),
  }),
});

const SelectionsSource = new VectorSource({ wrapX: false });

const SelectionsVector = new VectorLayer({
  source: SelectionsSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(255, 0, 0, 0.5)",
    }),
    stroke: new Stroke({
      color: "rgba(255, 0, 0, 1)",
      width: 2,
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: "#ffcc33",
      }),
    }),
  }),
});

/////////////// 팝업 부분 ///////////////
const info = document.getElementById("info");

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest(".ol-control")
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    console.log("feature:" + feature);
    info.style.left = pixel[0] + "px";
    info.style.top = pixel[1] + "px";
    if (feature !== currentFeature) {
      info.style.visibility = "visible";
      info.innerText = feature.get("jibun");
    }
  } else {
    info.style.visibility = "hidden";
  }
  currentFeature = feature;
};

const popup = document.getElementById("popup");

overlay = new Overlay({
  element: popup,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

/////////////////////////////////////////

const map = new Map({
  layers: [
    raster,
    vectorLayer2,
    vectorLayer,
    SelectionsVector,
    DrawVector,
    selectLayer,
  ],
  overlays: [overlay],
  target: "map",
  view: new View({
    center: initialCenter,
    maxZoom: 19,
    zoom: initialZoom,
  }),
});

const selectedStyle = new Style({
  fill: new Fill({
    color: "rgba(153, 51, 0, 0.6)",
  }),
  stroke: new Stroke({
    color: "rgba(153, 51, 0, 0.7)",
    width: 2,
  }),
});

const select = new Select({
  style: function (feature) {
    const color = feature.get("COLOR_BIO") || "#eeeeee";
    selectedStyle.getFill().setColor(color);
    return selectedStyle;
  },
});
map.addInteraction(select);

const selectedFeatures = select.getFeatures();

const draw = new Draw({
  source: DrawSource,
  type: "Polygon",
});

map.addInteraction(draw);

// 마우스로 그린 영역과 지도 간의 인터섹트 수행
draw.on("drawend", function (e) {
  DrawSource.clear();
  SelectionsSource.clear();
  const extent = e.feature.getGeometry().getExtent();
  const geomA = e.feature.getGeometry();
  vectorSource.forEachFeatureInExtent(extent, function (aa) {
    if (polyIntersectsPoly(geomA, aa.getGeometry()) === true) {
      SelectionsSource.addFeature(aa);
      selectedFeatures.push(aa);
    }
  });
});

// 인터섹트 함수
function polyIntersectsPoly(polygeomA, polygeomB) {
  const geomA = new jsts.io.GeoJSONReader().read(
    new GeoJSON().writeFeatureObject(
      new Feature({
        geometry: polygeomA,
      })
    )
  ).geometry;
  const geomB = new jsts.io.GeoJSONReader().read(
    new GeoJSON().writeFeatureObject(
      new Feature({
        geometry: polygeomB,
      })
    )
  ).geometry;
  return geomA.intersects(geomB);
}

draw.on("drawstart", function () {
  selectedFeatures.clear();
});

document.addEventListener("DOMContentLoaded", function () {
  const aaa01 = document.getElementById("aaa01");
  const aaa02 = document.getElementById("aaa02");
  const aaa03 = document.getElementById("aaa03");
  const aaa04 = document.getElementById("aaa04");
  const comboBox = document.getElementById("selectedRegions");
  const selectedValueDisplay = document.getElementById("selectedValueDisplay");
  const selectedValueDisplay2 = document.getElementById(
    "selectedValueDisplay2"
  );

  // 콤보박스 값 변경 시 선택된 값을 표시 및 변수에 저장
  let clickedFeatureJibun = null;
  let clickedFeatureA1 = null; // pnu
  let clickedFeatureA20 = null; // 경사도(ex: 완만함)
  let clickedFeatureA11 = null; // 지목
  let clickedFeatureA12 = null; // 면적
  let clickedFeatureA14 = null; // 용도지역
  let clickedFeatureA22 = null; // 토지형태
  let clickedFeatureA24 = null; // 도로인접여부
  let clickedFeatureslope = null; // 경사도
  let clickedFeatureheight = null; // 표고
  let clickedFeature_dist_gi_str = null; // 기개발지와의 거리
  let clickedFeature_dist_gong_ntwk = null; // 공공편익시설과의 거리(네트워크)
  let clickedFeature_record_slope = null; // 경사도 점수

  let insertedA20 = {};
  let inserted_record_slope = {};

  selectedFeatures.on(["add", "remove"], function () {
    const names = selectedFeatures.getArray().map(function (feature) {
      const jibun = feature.get("jibun") || "필지 선택";
      const a1 = feature.get("a1") || ""; // a1 값을 가져옴
      const a11 = feature.get("a11") || ""; // a11 값을 가져옴
      const a12 = feature.get("a12") || ""; // a12 값을 가져옴
      const a14 = feature.get("a14") || ""; // a14 값을 가져옴
      const a20 = feature.get("a20") || ""; // a20 값을 가져옴
      const a22 = feature.get("a22") || ""; // a22 값을 가져옴
      const a24 = feature.get("a24") || ""; // a24 값을 가져옴
      const slope = feature.get("slope") || ""; // slope 값을 가져옴
      const height = feature.get("height") || "";
      const dist_gi_str = feature.get("dist_gi_str") || "";
      const dist_gong_ntwk = feature.get("dist_gong_ntwk") || "";
      const record_slope = feature.get("record_slope") || "";
      // console.log("slope:" + slope);
      return {
        jibun,
        a1,
        a11,
        a12,
        a14,
        a20,
        a22,
        a24,
        slope,
        height,
        dist_gi_str,
        dist_gong_ntwk,
        record_slope,
      };
    });
    updateComboBox(names);
  });

  function updateComboBox(features) {
    comboBox.innerHTML = "";
    features.forEach(function (feature) {
      if (feature.jibun) {
        const option = document.createElement("option");
        option.value = feature.jibun;
        option.text = feature.jibun;
        option.setAttribute("a1", feature.a1); // a1 데이터 속성으로 추가
        option.setAttribute("a11", feature.a11); // a11 데이터 속성으로 추가
        option.setAttribute("a12", feature.a12); // a12 데이터 속성으로 추가
        option.setAttribute("a14", feature.a14); // a14 데이터 속성으로 추가
        option.setAttribute("a20", feature.a20); // a20 데이터 속성으로 추가
        option.setAttribute("a22", feature.a22); // a22 데이터 속성으로 추가
        option.setAttribute("a24", feature.a24); // a24 데이터 속성으로 추가
        option.setAttribute("slope", feature.slope); // 경사도 데이터 속성으로 추가
        option.setAttribute("height", feature.height); // 표고 데이터 속성으로 추가
        option.setAttribute("dist_gi_str", feature.dist_gi_str);
        option.setAttribute("dist_gong_ntwk", feature.dist_gong_ntwk);
        option.setAttribute("record_slope", feature.record_slope); // 경사도 점수 데이터 속성으로 추가
        comboBox.appendChild(option);
      }
    });
  }

  // 콤보박스 값 변경 시 선택된 지번을 표시
  comboBox.addEventListener("change", function () {
    selectedValueDisplay.textContent = comboBox.value;
    selectedValueDisplay2.textContent = comboBox.value.substring(4);
    clickedFeatureJibun = comboBox.value;
    const selectedOption = comboBox.options[comboBox.selectedIndex];
    clickedFeatureA1 = selectedOption.getAttribute("a1"); // pnu
    clickedFeatureA20 = selectedOption.getAttribute("a20"); // 경사도
    clickedFeatureA11 = selectedOption.getAttribute("a11"); // 지목
    clickedFeatureA12 = selectedOption.getAttribute("a12"); // 면적
    clickedFeatureA14 = selectedOption.getAttribute("a14"); // 용도지역
    clickedFeatureA22 = selectedOption.getAttribute("a22"); // 토지형태
    clickedFeatureA24 = selectedOption.getAttribute("a24"); // 도로인접여부
    clickedFeatureslope = selectedOption.getAttribute("slope"); // 경사도
    clickedFeatureheight = selectedOption.getAttribute("height"); // 표고
    clickedFeature_dist_gi_str = selectedOption.getAttribute("dist_gi_str");
    clickedFeature_dist_gong_ntwk =
      selectedOption.getAttribute("dist_gong_ntwk");
    clickedFeature_record_slope = selectedOption.getAttribute("record_slope"); // 경사도 점수
    document.getElementById("fetchData_link").href =
      "./fetchData.jsp?selectedA1='" + clickedFeatureA1 + "'";

    // 필드 값 비우기
    document.getElementById("aaa01").value = "";
    document.getElementById("aaa02").value = "";
    document.getElementById("aaa03").value = "";
    document.getElementById("aaa04").value = "";
    document.getElementById("aaaa01").value = "";

    // selectLayer 업데이트 및 표시
    makeWFSSource2(clickedFeatureJibun);

    return (
      clickedFeatureA1,
      clickedFeatureA20,
      clickedFeatureA11,
      clickedFeatureA12,
      clickedFeatureA14,
      clickedFeatureA22,
      clickedFeatureA24,
      clickedFeatureslope,
      clickedFeatureJibun,
      clickedFeatureheight,
      clickedFeature_record_slope
    );
  });

  // 조회 버튼 클릭시 db에 저장된 지표값 표시
  document.getElementById("searchData").onclick = () => {
    // if (insertedA20[clickedFeatureA1] === undefined) {
    if (inserted_record_slope[clickedFeatureA1] === undefined) {
      console.log("insertedA20 is null for current A1");
      aaa01.innerText = clickedFeatureslope; // span, div, p -> innerText
      aaa02.innerText = clickedFeatureheight; // span, div, p -> innerText
      aaa03.innerText = clickedFeature_dist_gi_str; // span, div, p -> innerText
      aaa04.innerText = clickedFeature_dist_gong_ntwk; // span, div, p -> innerText
      console.log("clickedFeatureslope:" + clickedFeatureslope);
      console.log("clickedFeatureheight:" + clickedFeatureheight);
      console.log("clickedFeature_dist_gi_str:" + clickedFeature_dist_gi_str);
      console.log(
        "clickedFeature_dist_gong_ntwk:" + clickedFeature_dist_gong_ntwk
      );
      document.getElementById("aaaa01").value = clickedFeature_record_slope; // input, textarea, select -> value
    } else {
      console.log("insertedA20 is not null for current A1");
      aaa01.innerText = clickedFeatureslope;
      aaa02.innerText = clickedFeatureheight;
      aaa03.innerText = clickedFeature_dist_gi_str; // span, div, p -> innerText
      aaa04.innerText = clickedFeature_dist_gong_ntwk; // span, div, p -> innerText

      document.getElementById("aaaa01").value =
        inserted_record_slope[clickedFeatureA1];
    }
    // 팝업 표시
    const selectedFeature = vectorSource
      .getFeatures()
      .find((feature) => feature.get("jibun") === clickedFeatureJibun);
    if (selectedFeature) {
      document.getElementById("info-title").innerHTML = clickedFeatureJibun;
      document.getElementById("info01").innerHTML =
        "지목: " + clickedFeatureA11;
      document.getElementById("info02").innerHTML =
        "면적: " + clickedFeatureA12 + "㎡";
      document.getElementById("info03").innerHTML =
        "용도지역: " + clickedFeatureA14;
      document.getElementById("info04").innerHTML =
        "토지형태: " + clickedFeatureA22;
      document.getElementById("info05").innerHTML =
        "도로인접면: " + clickedFeatureA24;

      if (centers2[emdid]) {
        const selectedCenter = centers2[emdid];
        overlay.setPosition(selectedCenter);
      } else {
        console.log("Selected center not found in centers object");
      }
    }
  };

  // 입력 버튼 클릭시 작성한 지표값 db에 저장
  document.getElementById("insertData").onclick = () => {
    const aaaa01_value = document.getElementById("aaaa01").value;
    inserted_record_slope[clickedFeatureA1] = aaaa01_value;

    // 선택된 지번과 레이어 정보 저장
    localStorage.setItem("clickedFeatureA1", clickedFeatureA1);
    localStorage.setItem("insertedA20", JSON.stringify(insertedA20));
    localStorage.setItem(
      "inserted_record_slope",
      JSON.stringify(inserted_record_slope)
    );

    sendData(clickedFeatureA1, aaaa01_value);
  };

  // 서버로 데이터 전송
  function sendData(clickedFeatureA1, inserted_record_slope) {
    var url = `./fetchData.jsp?selectedA1=${encodeURIComponent(
      clickedFeatureA1
    )}&inserted_record_slope=${encodeURIComponent(inserted_record_slope)}`;
    fetch(url, {
      method: "POST", // 서버와의 데이터 전송 방식을 지정합니다 (GET 또는 POST)
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Response from server:", data);
        // 서버로부터의 응답을 처리합니다
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  document.getElementById("backButton").onclick = () => {
    // 슬라이드 애니메이션을 위해 기존 클래스 제거
    document.getElementById("menu1").classList.remove("slide-out", "slide-in");
    document
      .getElementById("menu2")
      .classList.remove("menu2-slide-in", "menu2-slide-out");
    document
      .getElementById("mapArea")
      .classList.remove("map-expand", "map-contract");

    // 초기 상태로 되돌리기 위해 새로운 클래스 추가
    document.getElementById("menu1").classList.add("slide-in");
    document.getElementById("menu2").classList.add("menu2-slide-out");
    document.getElementById("mapArea").classList.add("map-contract");

    // 평가 지표 입력 메뉴 숨기기
    document.getElementById("menu2").classList.add("hidden");

    // 지도 중심과 확대 수준을 초기 상태로 되돌림
    const view = map.getView();
    view.animate({
      center: initialCenter,
      zoom: initialZoom,
      duration: 1000, // 1초 동안 애니메이션
    });

    // 선택된 피처 해제
    selectedFeatures.clear();
    SelectionsSource.clear();
    vectorLayer.setVisible(false);
    SelectionsVector.setVisible(false);
    DrawVector.setVisible(false);
    selectLayer.setVisible(false);

    // 팝업 창 숨기기
    overlay.setPosition(undefined);
    const popup = document.getElementById("popup");
    popup.style.display = "none";
  };
});

for (let i = 0; i <= 9; i++) {
  const id = i < 10 ? "0" + i : i.toString();
  document.getElementById("emd" + id).onclick = () => {
    emdid = "emd" + id;
    console.log(emdid + " clicked");
    makeWFSSource("emd" + id);

    // 슬라이드 애니메이션을 위해 기존 클래스 제거
    document.getElementById("menu1").classList.remove("slide-in", "slide-out");
    document
      .getElementById("menu2")
      .classList.remove("menu2-slide-out", "menu2-slide-in");
    document
      .getElementById("mapArea")
      .classList.remove("map-contract", "map-expand");

    // 새로운 클래스 추가
    document.getElementById("menu1").classList.add("slide-out");
    document.getElementById("menu2").classList.add("menu2-slide-in");
    document.getElementById("mapArea").classList.add("map-expand");

    // 평가 지표 입력 메뉴 표시
    document.getElementById("menu2").classList.remove("hidden");

    // 팝업 요소 다시 표시
    const popup = document.getElementById("popup");
    popup.style.display = "block";
  };
}

// aaaa01 ~ aaaa04, bbbb01 ~ bbbb05의 값을 합산하여 devVal에 설정하는 함수
function calculateDevVal() {
  const aaaaValues = ["aaaa01", "aaaa02", "aaaa03", "aaaa04"].map(
    (id) => parseFloat(document.getElementById(id).value) || 0
  );
  const bbbbValues = ["bbbb01", "bbbb02", "bbbb03", "bbbb04"].map(
    (id) => parseFloat(document.getElementById(id).value) || 0
  );

  const devVal = aaaaValues
    .concat(bbbbValues)
    .reduce((acc, val) => acc + val, 0);

  document.getElementById("devVal").value = devVal;
  document.getElementById("input2").value = devVal;
  calculateResultVal(); // input2 변경 시 input4도 갱신
}

// cccc01 ~ cccc04, dddd01 ~ dddd05의 값을 합산하여 conVal에 설정하는 함수
function calculateConVal() {
  const ccccValues = ["cccc01", "cccc02", "cccc03", "cccc04"].map(
    (id) => parseFloat(document.getElementById(id).value) || 0
  );
  const ddddValues = ["dddd01", "dddd02", "dddd03", "dddd04", "dddd05"].map(
    (id) => parseFloat(document.getElementById(id).value) || 0
  );

  const conVal = ccccValues
    .concat(ddddValues)
    .reduce((acc, val) => acc + val, 0);

  document.getElementById("conVal").value = conVal;
  document.getElementById("input3").value = conVal;
  calculateResultVal(); // input3 변경 시 input4도 갱신
}

// input2와 input3의 값을 계산하여 input4에 설정하는 함수
function calculateResultVal() {
  const devVal = parseFloat(document.getElementById("input2").value) || 0;
  const conVal = parseFloat(document.getElementById("input3").value) || 0;
  const resultVal = devVal - conVal;
  document.getElementById("input4").value = resultVal;
}

// 이벤트 리스너 추가
["aaaa01", "aaaa02", "aaaa03", "aaaa04"].forEach((id) => {
  document.getElementById(id).addEventListener("input", calculateDevVal);
});
["bbbb01", "bbbb02", "bbbb03", "bbbb04"].forEach((id) => {
  document.getElementById(id).addEventListener("input", calculateDevVal);
});
["cccc01", "cccc02", "cccc03", "cccc04"].forEach((id) => {
  document.getElementById(id).addEventListener("input", calculateConVal);
});
["dddd01", "dddd02", "dddd03", "dddd04", "dddd05"].forEach((id) => {
  document.getElementById(id).addEventListener("input", calculateConVal);
});

// 초기 계산
calculateDevVal();
calculateConVal();
