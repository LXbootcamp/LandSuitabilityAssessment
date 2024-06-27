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

// 읍면동 중심 위치 설정
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

// 팝업창 위치 설정
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

// 읍면동 레이어에 대한 부분
function makeFilter1(method) {
  let filter1 = "";

  if ("emd00" == method) filter1 = "ld_cpsgemd_nm like '%무안군%'";
  else if ("emd01" == method) filter1 = "ld_cpsgemd_nm like '%망운면%'";
  else if ("emd02" == method) filter1 = "ld_cpsgemd_nm like '%몽탄면%'";
  else if ("emd03" == method) filter1 = "ld_cpsgemd_nm like '%무안읍%'";
  else if ("emd04" == method) filter1 = "ld_cpsgemd_nm like '%삼향읍%'";
  else if ("emd05" == method) filter1 = "ld_cpsgemd_nm like '%운남면%'";
  else if ("emd06" == method) filter1 = "ld_cpsgemd_nm like '%일로읍%'";
  else if ("emd07" == method) filter1 = "ld_cpsgemd_nm like '%청계면%'";
  else if ("emd08" == method) filter1 = "ld_cpsgemd_nm like '%해제면%'";
  else if ("emd09" == method) filter1 = "ld_cpsgemd_nm like '%현경면%'";
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

// 선택 지번 레이어에 대한 부분
function makeFilter(click_F_Jibun) {
  let filter = "jibun = '";
  filter += click_F_Jibun + "'";
  return filter;
}

function makeWFSSource2(click_F_Jibun) {
  vectorSource3 = new VectorSource({
    url: encodeURI(
      "http://localhost:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan2&outputFormat=application/json&CQL_FILTER=" +
      makeFilter(click_F_Jibun)
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

function makeWFSSource(method) {
  vectorSource = new VectorSource({
    url: encodeURI(
      "http://localhost:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan2&outputFormat=application/json&CQL_FILTER=" +
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

// 종합적성값 구간별 색상 넣는 레이어 생성
function styleFunction(feature) {
  var value = feature.get('value_comp');
  var color;
  if (value < -180) {
    color = "rgba(0, 78, 0, 1.0)";
  } else if (value < -60) {
    color = "rgba(0, 200, 0, 1.0)";
  } else if (value < 60) {
    color = "rgba(255, 211, 0, 1.0)";
  } else if (value < 180) {
    color = "rgba(255, 75, 0, 1.0)";
  } else {
    color = "rgba(180, 0, 0, 1.0)";
  }
  return new Style({
    fill: new Fill({
      color: color
    }),
    stroke: new Stroke({
      color: 'black',
      width: 1
    })
  });
}

vectorLayer = new VectorLayer({ // 필지별 지적도 레이어
  source: null, // 초기에는 소스를 설정하지 않음
  visible: false, // 초기에는 보이지 않도록 설정
  style: new Style({
    stroke: new Stroke({
      color: "rgba(0, 153, 051, 1.0)",
      width: 2,
    }),
  }),
});

const raster = new Tile({ // 배경 지도 레이어
  source: new OSM({}),
});

const DrawSource = new VectorSource({ wrapX: false });

const DrawVector = new VectorLayer({ // 그린 영역 레이어
  source: DrawSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0)",
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
  source: SelectionsSource, // 초기에는 소스를 설정하지 않음
  style: styleFunction, // 스타일 함수 사용
  visible: false, // 초기에는 보이지 않도록 설정
});


// 팝업 부분
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


const map = new Map({
  layers: [
    raster,
    vectorLayer2,
    vectorLayer,
    selectLayer,
    SelectionsVector,
    DrawVector,
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
    color: "rgba(153, 51, 0, 0.6)",
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
  const bbb01 = document.getElementById("bbb01");
  const bbb02 = document.getElementById("bbb02");
  const bbb03 = document.getElementById("bbb03");
  const ccc01 = document.getElementById("ccc01");
  const ccc02 = document.getElementById("ccc02");
  const ccc03 = document.getElementById("ccc03");
  const ccc04 = document.getElementById("ccc04");
  const ddd01 = document.getElementById("ddd01");
  const ddd02 = document.getElementById("ddd02");
  const ddd03 = document.getElementById("ddd03");
  const ddd04 = document.getElementById("ddd04");
  const ddd05 = document.getElementById("ddd05");

  const comboBox = document.getElementById("selectedRegions");
  const selectedValueDisplay = document.getElementById("selectedValueDisplay");
  const selectedValueDisplay2 = document.getElementById("selectedValueDisplay2");


  // 콤보박스 값 변경 시 선택된 값을 표시 및 변수에 저장
  let click_F_Jibun = null;
  let click_F_pnu = null; // pnu
  let click_F_tpgrph_hg_code_nm = null; // 경사도(ex: 완만함)
  let click_F_lndcgr_code_nm = null; // 지목
  let click_F_lndpcl_ar = null; // 면적
  let click_F_prpos_area_1_nm = null; // 용도지역
  let click_F_tpgrph_frm_code = null; // 토지형태
  let click_F_road_side_code_nm = null; // 도로인접여부
  let click_F_slope = null; // 경사도
  let click_F_height = null; // 표고
  let click_F_dist_gi_str = null; // 기개발지와의 거리
  let click_F_dist_gong_ntwk = null; // 공공편익시설거리(네트워크)
  let click_F_rate_city = null; // 도시용지비율
  let click_F_rate_city_touch = null; // 도시용지인접비율
  let click_F_dist_road_touch = null; // 도로인접거리(필지중심기준)
  let click_F_rate_kyungji = null; // 경지정리면적비율
  let click_F_rate_saengtae = null; // 생태자연도상위등급비율
  let click_F_rate_gongjuck = null; // 공적규제지역면적비율
  let click_F_dist_gongjuck = null; // 공적규제지역과의거리
  let click_F_rate_jdgarea = null; // 전답과수원면적비율
  let click_F_rate_nongup = null; // 농업진흥지역비율
  let click_F_rate_limsangdo = null; // 임상도상위등급비율
  let click_F_rate_bojunmount = null; // 보전지역산지비율
  let click_F_dist_kyungji = null; // 경지정리지역와의거리


  let click_F_record_slope = null; // 경사도 점수
  let click_F_record_height = null; // 표고 점수
  let click_F_record_dist_gi_str = null;
  let click_F_record_dist_gong_ntwk = null;
  let click_F_record_rate_city = null;
  let click_F_record_rate_city_touch = null;
  let click_F_record_dist_road = null;
  let click_F_record_rate_kyungji = null;
  let click_F_record_rate_saengtae = null;
  let click_F_record_rate_gongjuck = null;
  let click_F_record_dist_gongjuck = null;
  let click_F_record_rate_jdgarea = null;
  let click_F_record_rate_nongup = null;
  let click_F_record_rate_limsangdo = null;
  let click_F_record_rate_bojunmount = null;
  let click_F_record_dist_kyungji = null;

  let click_F_value_develop = null; // 개발적성값 점수
  let click_F_value_conserv = null; // 보전적성값 점수
  let click_F_value_comp = null; // 종합적성값 점수

  let inserted_tpgrph_hg_code_nm = {};
  let inserted_record_slope = {};
  let inserted_record_height = {};
  let inserted_record_dist_gi_str = {};
  let inserted_record_dist_gong_ntwk = {};
  let inserted_record_rate_city = {};
  let inserted_record_rate_city_touch = {};
  let inserted_record_dist_road = {};
  let inserted_record_rate_kyungji = {};
  let inserted_record_rate_saengtae = {};
  let inserted_record_rate_gongjuck = {}; 
  let inserted_record_dist_gongjuck = {};
  let inserted_record_rate_jdgarea = {};
  let inserted_record_rate_nongup = {};
  let inserted_record_rate_limsangdo = {};
  let inserted_record_rate_bojunmount = {};
  let inserted_record_dist_kyungji = {};

  let inserted_value_develop = {};
  let inserted_value_conserv = {};
  let inserted_value_comp = {};

  // 버튼 클릭 시 SelectionsVector 레이어를 보이도록 설정
  document.getElementById("showOnMap").addEventListener("click", function () {
    SelectionsVector.setVisible(true);
    selectedFeatures.clear();
  });
  selectedFeatures.on(["add", "remove"], function () {
    const names = selectedFeatures.getArray().map(function (feature) {
      const jibun = feature.get("jibun") || "필지 선택";
      const pnu = feature.get("pnu") || ""; // pnu 값을 가져옴
      const lndcgr_code_nm = feature.get("lndcgr_code_nm") || ""; // lndcgr_code_nm 값을 가져옴
      const lndpcl_ar = feature.get("lndpcl_ar") || ""; // lndpcl_ar 값을 가져옴
      const prpos_area_1_nm = feature.get("prpos_area_1_nm") || ""; // prpos_area_1_nm 값을 가져옴
      const tpgrph_hg_code_nm = feature.get("tpgrph_hg_code_nm") || ""; // tpgrph_hg_code_nm 값을 가져옴
      const tpgrph_frm_code = feature.get("tpgrph_frm_code") || ""; // tpgrph_frm_code 값을 가져옴
      const road_side_code_nm = feature.get("road_side_code_nm") || ""; // road_side_code_nm 값을 가져옴
      const slope = feature.get("slope") || ""; // slope 값을 가져옴
      const height = feature.get("height") || "";
      const dist_gi_str = feature.get("dist_gi_str") || "";
      const dist_gong_ntwk = feature.get("dist_gong_ntwk") || "";
      const rate_city = feature.get("rate_city") || "";
      const rate_city_touch = feature.get("rate_city_touch") || "";
      const dist_road_touch = feature.get("dist_road_touch") || "";
      const rate_kyungji = feature.get("rate_kyungji") || "";
      const rate_saengtae = feature.get("rate_saengtae") || "";
      const rate_gongjuck = feature.get("rate_gongjuck") || "";
      const dist_gongjuck = feature.get("dist_gongjuck") || "";
      const rate_jdgarea = feature.get("rate_jdgarea") || "";
      const rate_nongup = feature.get("rate_nongup") || "";
      const rate_limsangdo = feature.get("rate_limsangdo") || "";
      const rate_bojunmount = feature.get("rate_bojunmount") || "";
      const dist_kyungji = feature.get("dist_kyungji") || "";


      const record_slope = feature.get("record_slope") || "";
      const record_height = feature.get("record_height") || "";
      const record_dist_gi_str = feature.get("record_dist_gi_str") || "";
      const record_dist_gong_ntwk = feature.get("record_dist_gong_ntwk") || "";
      const record_rate_city = feature.get("record_rate_city") || "";
      const record_rate_city_touch = feature.get("record_rate_city_touch") || "";
      const record_dist_road = feature.get("record_dist_road") || "";
      const record_rate_kyungji = feature.get("record_rate_kyungji") || "";
      const record_rate_saengtae = feature.get("record_rate_saengtae") || "";
      const record_rate_gongjuck = feature.get("record_rate_gongjuck") || "";
      const record_dist_gongjuck = feature.get("record_dist_gongjuck") || "";
      const record_rate_jdgarea = feature.get("record_rate_jdgarea") || "";
      const record_rate_nongup = feature.get("record_rate_nongup") || "";
      const record_rate_limsangdo = feature.get("record_rate_limsangdo") || "";
      const record_rate_bojunmount = feature.get("record_rate_bojunmount") || "";
      const record_dist_kyungji = feature.get("record_dist_kyungji") || "";
      const value_develop = feature.get("value_develop") || "";
      const value_conserv = feature.get("value_conserv") || "";
      const value_comp = feature.get("value_comp") || "";
      console.log("record_slope:" + record_slope);
      console.log("<br>record_height:" + record_height);
      return { jibun, pnu, lndcgr_code_nm, lndpcl_ar, prpos_area_1_nm, tpgrph_hg_code_nm, tpgrph_frm_code, road_side_code_nm, slope, height, dist_gi_str, dist_gong_ntwk, rate_city, rate_city_touch, dist_road_touch, rate_kyungji, rate_saengtae, rate_gongjuck, dist_gongjuck, rate_jdgarea, rate_nongup, rate_limsangdo, rate_bojunmount, dist_kyungji, record_slope, record_height, record_dist_gi_str, record_dist_gong_ntwk, record_rate_city, record_rate_city_touch, record_dist_road, record_rate_kyungji, record_rate_saengtae, record_rate_gongjuck, record_dist_gongjuck, record_rate_jdgarea, record_rate_nongup, record_rate_limsangdo, record_rate_bojunmount, record_dist_kyungji, value_develop, value_conserv, value_comp };
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
        option.setAttribute("pnu", feature.pnu); // pnu 데이터 속성으로 추가
        option.setAttribute("lndcgr_code_nm", feature.lndcgr_code_nm); // lndcgr_code_nm 데이터 속성으로 추가
        option.setAttribute("lndpcl_ar", feature.lndpcl_ar); // lndpcl_ar 데이터 속성으로 추가
        option.setAttribute("prpos_area_1_nm", feature.prpos_area_1_nm); // prpos_area_1_nm 데이터 속성으로 추가
        option.setAttribute("tpgrph_hg_code_nm", feature.tpgrph_hg_code_nm); // tpgrph_hg_code_nm 데이터 속성으로 추가
        option.setAttribute("tpgrph_frm_code", feature.tpgrph_frm_code); // tpgrph_frm_code 데이터 속성으로 추가
        option.setAttribute("road_side_code_nm", feature.road_side_code_nm); // road_side_code_nm 데이터 속성으로 추가
        option.setAttribute("slope", feature.slope); // 경사도 데이터 속성으로 추가
        option.setAttribute("height", feature.height); // 표고 데이터 속성으로 추가
        option.setAttribute("dist_gi_str", feature.dist_gi_str);
        option.setAttribute("dist_gong_ntwk", feature.dist_gong_ntwk);
        option.setAttribute("rate_city", feature.rate_city);
        option.setAttribute("rate_city_touch", feature.rate_city_touch);
        option.setAttribute("dist_road_touch", feature.dist_road_touch);
        option.setAttribute("rate_kyungji", feature.rate_kyungji);
        option.setAttribute("rate_saengtae", feature.rate_saengtae);
        option.setAttribute("rate_gongjuck", feature.rate_gongjuck);
        option.setAttribute("dist_gongjuck", feature.dist_gongjuck);
        option.setAttribute("rate_jdgarea", feature.rate_jdgarea);
        option.setAttribute("rate_nongup", feature.rate_nongup);
        option.setAttribute("rate_limsangdo", feature.rate_limsangdo);
        option.setAttribute("rate_bojunmount", feature.rate_bojunmount);
        option.setAttribute("dist_kyungji", feature.dist_kyungji);

        ////////// 점수 데이터 추가 //////////
        option.setAttribute("record_slope", feature.record_slope);
        option.setAttribute("record_height", feature.record_height);
        option.setAttribute("record_dist_gi_str", feature.record_dist_gi_str);
        option.setAttribute("record_dist_gong_ntwk", feature.record_dist_gong_ntwk);
        option.setAttribute("record_rate_city", feature.record_rate_city);
        option.setAttribute("record_rate_city_touch", feature.record_rate_city_touch);
        option.setAttribute("record_dist_road", feature.record_dist_road);
        option.setAttribute("record_rate_kyungji", feature.record_rate_kyungji);
        option.setAttribute("record_rate_saengtae", feature.record_rate_saengtae);
        option.setAttribute("record_rate_gongjuck", feature.record_rate_gongjuck);
        option.setAttribute("record_dist_gongjuck", feature.record_dist_gongjuck);
        option.setAttribute("record_rate_jdgarea", feature.record_rate_jdgarea);
        option.setAttribute("record_rate_nongup", feature.record_rate_nongup);
        option.setAttribute("record_rate_limsangdo", feature.record_rate_limsangdo);
        option.setAttribute("record_rate_bojunmount", feature.record_rate_bojunmount);
        option.setAttribute("record_dist_kyungji", feature.record_dist_kyungji);
        option.setAttribute("value_develop", feature.value_develop);
        option.setAttribute("value_conserv", feature.value_conserv);
        option.setAttribute("value_comp", feature.value_comp);
        comboBox.appendChild(option);
      }
    });
  }

  // 콤보박스 값 변경 시 선택된 지번을 표시
  comboBox.addEventListener("change", function () {
    selectedValueDisplay.textContent = comboBox.value;
    selectedValueDisplay2.textContent = comboBox.value.substring(4);
    click_F_Jibun = comboBox.value;
    const selectedOption = comboBox.options[comboBox.selectedIndex];
    click_F_pnu = selectedOption.getAttribute("pnu"); // pnu
    click_F_tpgrph_hg_code_nm = selectedOption.getAttribute("tpgrph_hg_code_nm"); // 경사도
    click_F_lndcgr_code_nm = selectedOption.getAttribute("lndcgr_code_nm"); // 지목
    click_F_lndpcl_ar = selectedOption.getAttribute("lndpcl_ar"); // 면적
    click_F_prpos_area_1_nm = selectedOption.getAttribute("prpos_area_1_nm"); // 용도지역
    click_F_tpgrph_frm_code = selectedOption.getAttribute("tpgrph_frm_code"); // 토지형태
    click_F_road_side_code_nm = selectedOption.getAttribute("road_side_code_nm"); // 도로인접여부
    click_F_slope = selectedOption.getAttribute("slope"); // 경사도
    click_F_height = selectedOption.getAttribute("height"); // 표고
    click_F_dist_gi_str = selectedOption.getAttribute("dist_gi_str");
    click_F_dist_gong_ntwk = selectedOption.getAttribute("dist_gong_ntwk");
    click_F_rate_city = selectedOption.getAttribute("rate_city");
    click_F_rate_city_touch = selectedOption.getAttribute("rate_city_touch");
    click_F_dist_road_touch = selectedOption.getAttribute("dist_road_touch");
    click_F_rate_kyungji = selectedOption.getAttribute("rate_kyungji");
    click_F_rate_saengtae = selectedOption.getAttribute("rate_saengtae");
    click_F_rate_gongjuck = selectedOption.getAttribute("rate_gongjuck");
    click_F_dist_gongjuck = selectedOption.getAttribute("dist_gongjuck");
    click_F_rate_jdgarea = selectedOption.getAttribute("rate_jdgarea");
    click_F_rate_nongup = selectedOption.getAttribute("rate_nongup");
    click_F_rate_limsangdo = selectedOption.getAttribute("rate_limsangdo");
    click_F_rate_bojunmount = selectedOption.getAttribute("rate_bojunmount");
    click_F_dist_kyungji = selectedOption.getAttribute("dist_kyungji");

    ////////// 점수 데이터 추가 //////////
    click_F_record_slope = selectedOption.getAttribute("record_slope"); // 경사도 점수
    click_F_record_height = selectedOption.getAttribute("record_height"); // 표고 점수
    click_F_record_dist_gi_str = selectedOption.getAttribute("record_dist_gi_str");
    click_F_record_dist_gong_ntwk = selectedOption.getAttribute("record_dist_gong_ntwk");
    click_F_record_rate_city = selectedOption.getAttribute("record_rate_city");
    click_F_record_rate_city_touch = selectedOption.getAttribute("record_rate_city_touch");
    click_F_record_dist_road = selectedOption.getAttribute("record_dist_road");
    click_F_record_rate_kyungji = selectedOption.getAttribute("record_rate_kyungji");
    click_F_record_rate_saengtae = selectedOption.getAttribute("record_rate_saengtae");
    click_F_record_rate_gongjuck = selectedOption.getAttribute("record_rate_gongjuck");
    click_F_record_dist_gongjuck = selectedOption.getAttribute("record_dist_gongjuck");
    click_F_record_rate_jdgarea = selectedOption.getAttribute("record_rate_jdgarea");
    click_F_record_rate_nongup = selectedOption.getAttribute("record_rate_nongup");
    click_F_record_rate_limsangdo = selectedOption.getAttribute("record_rate_limsangdo");
    click_F_record_rate_bojunmount = selectedOption.getAttribute("record_rate_bojunmount");
    click_F_record_dist_kyungji = selectedOption.getAttribute("record_dist_kyungji");
    click_F_value_develop = selectedOption.getAttribute("value_develop");
    click_F_value_conserv = selectedOption.getAttribute("value_conserv");
    click_F_value_comp = selectedOption.getAttribute("value_comp");
    document.getElementById("fetchData_link").href =
      "./fetchData.jsp?selected_pnu='" + click_F_pnu + "'";

    // 필드 값 비우기
    document.getElementById("aaa01").value = "";
    document.getElementById("aaa02").value = "";
    document.getElementById("aaa03").value = "";
    document.getElementById("aaa04").value = "";
    document.getElementById("bbb01").value = "";
    document.getElementById("bbb02").value = "";
    document.getElementById("bbb03").value = "";
    document.getElementById("ccc01").value = "";
    document.getElementById("ccc02").value = "";
    document.getElementById("ccc03").value = "";
    document.getElementById("ccc04").value = "";
    document.getElementById("ddd01").value = "";
    document.getElementById("ddd02").value = "";
    document.getElementById("ddd03").value = "";
    document.getElementById("ddd04").value = "";
    document.getElementById("ddd05").value = "";
    document.getElementById("aaaa01").value = "";
    document.getElementById("aaaa02").value = "";
    document.getElementById("aaaa03").value = "";
    document.getElementById("aaaa04").value = "";
    document.getElementById("bbbb01").value = "";
    document.getElementById("bbbb02").value = "";
    document.getElementById("bbbb03").value = "";
    document.getElementById("cccc01").value = "";
    document.getElementById("cccc02").value = "";
    document.getElementById("cccc03").value = "";
    document.getElementById("cccc04").value = "";
    document.getElementById("dddd01").value = "";
    document.getElementById("dddd02").value = "";
    document.getElementById("dddd03").value = "";
    document.getElementById("dddd04").value = "";
    document.getElementById("dddd05").value = "";
    document.getElementById("input2").value = "";
    document.getElementById("input3").value = "";
    document.getElementById("input4").value = "";

    // selectLayer 업데이트 및 표시
    makeWFSSource2(click_F_Jibun);
  });



  // 조회 버튼 클릭시 db에 저장된 지표값 표시
  function fetchDataAndDisplay() {
    // document.getElementById("searchData").onclick = () => {
    if (inserted_record_slope[click_F_pnu] === undefined) { // 수정값이 없는 경우 - 즉, 처음 조회하는 경우
      console.log("inserted_tpgrph_hg_code_nm is null for current pnu");
      aaa01.innerText = click_F_slope; // span, div, p -> innerText
      aaa02.innerText = click_F_height; // span, div, p -> innerText
      aaa03.innerText = click_F_dist_gi_str; // span, div, p -> innerText
      aaa04.innerText = click_F_dist_gong_ntwk; // span, div, p -> innerText
      bbb01.innerText = click_F_rate_city; // span, div, p -> innerText
      bbb02.innerText = click_F_rate_city_touch; // span, div, p -> innerText
      bbb03.innerText = click_F_dist_road_touch; // span, div, p -> innerText
      ccc01.innerText = click_F_rate_kyungji; // span, div, p -> innerText
      ccc02.innerText = click_F_rate_saengtae; // span, div, p -> innerText
      ccc03.innerText = click_F_rate_gongjuck; // span, div, p -> innerText
      ccc04.innerText = click_F_dist_gongjuck; // span, div, p -> innerText
      ddd01.innerText = click_F_rate_jdgarea; // span, div, p -> innerText
      ddd02.innerText = click_F_rate_nongup; // span, div, p -> innerText
      ddd03.innerText = click_F_rate_limsangdo; // span, div, p -> innerText
      ddd04.innerText = click_F_rate_bojunmount; // span, div, p -> innerText
      ddd05.innerText = click_F_dist_kyungji; // span, div, p -> innerText

      document.getElementById("aaaa01").value = click_F_record_slope; // input, textarea, select -> value
      document.getElementById("aaaa02").value = click_F_record_height; // input, textarea, select -> value
      document.getElementById("aaaa03").value = click_F_record_dist_gi_str;
      document.getElementById("aaaa04").value = click_F_record_dist_gong_ntwk;
      document.getElementById("bbbb01").value = click_F_record_rate_city;
      document.getElementById("bbbb02").value = click_F_record_rate_city_touch;
      document.getElementById("bbbb03").value = click_F_record_dist_road;
      document.getElementById("cccc01").value = click_F_record_rate_kyungji;
      document.getElementById("cccc02").value = click_F_record_rate_saengtae;
      document.getElementById("cccc03").value = click_F_record_rate_gongjuck;
      document.getElementById("cccc04").value = click_F_record_dist_gongjuck;
      document.getElementById("dddd01").value = click_F_record_rate_jdgarea;
      document.getElementById("dddd02").value = click_F_record_rate_nongup;
      document.getElementById("dddd03").value = click_F_record_rate_limsangdo;
      document.getElementById("dddd04").value = click_F_record_rate_bojunmount;
      document.getElementById("dddd05").value = click_F_record_dist_kyungji;
      document.getElementById("input2").value = click_F_value_develop;
      document.getElementById("input3").value = click_F_value_conserv;
      document.getElementById("input4").value = click_F_value_comp;

    } else { // insertData로 수정한 값이 있는 경우
      console.log("inserted_tpgrph_hg_code_nm is not null for current pnu");
      aaa01.innerText = click_F_slope;
      aaa02.innerText = click_F_height;
      aaa03.innerText = click_F_dist_gi_str; // span, div, p -> innerText
      aaa04.innerText = click_F_dist_gong_ntwk; // span, div, p -> innerText
      bbb01.innerText = click_F_rate_city; // span, div, p -> innerText
      bbb02.innerText = click_F_rate_city_touch; // span, div, p -> innerText
      bbb03.innerText = click_F_dist_road_touch; // span, div, p -> innerText
      ccc01.innerText = click_F_rate_kyungji; // span, div, p -> innerText
      ccc02.innerText = click_F_rate_saengtae; // span, div, p -> innerText
      ccc03.innerText = click_F_rate_gongjuck; // span, div, p -> innerText
      ccc04.innerText = click_F_dist_gongjuck; // span, div, p -> innerText
      ddd01.innerText = click_F_rate_jdgarea; // span, div, p -> innerText
      ddd02.innerText = click_F_rate_nongup; // span, div, p -> innerText
      ddd03.innerText = click_F_rate_limsangdo; // span, div, p -> innerText
      ddd04.innerText = click_F_rate_bojunmount; // span, div, p -> innerText
      ddd05.innerText = click_F_dist_kyungji; // span, div, p -> innerText

      document.getElementById("aaaa01").value = inserted_record_slope[click_F_pnu];
      document.getElementById("aaaa02").value = inserted_record_height[click_F_pnu];
      document.getElementById("aaaa03").value = inserted_record_dist_gi_str[click_F_pnu];
      document.getElementById("aaaa04").value = inserted_record_dist_gong_ntwk[click_F_pnu];
      document.getElementById("bbbb01").value = inserted_record_rate_city[click_F_pnu];
      document.getElementById("bbbb02").value = inserted_record_rate_city_touch[click_F_pnu];
      document.getElementById("bbbb03").value = inserted_record_dist_road[click_F_pnu];
      document.getElementById("cccc01").value = inserted_record_rate_kyungji[click_F_pnu];
      document.getElementById("cccc02").value = inserted_record_rate_saengtae[click_F_pnu];
      document.getElementById("cccc03").value = inserted_record_rate_gongjuck[click_F_pnu];
      document.getElementById("cccc04").value = inserted_record_dist_gongjuck[click_F_pnu];
      document.getElementById("dddd01").value = inserted_record_rate_jdgarea[click_F_pnu];
      document.getElementById("dddd02").value = inserted_record_rate_nongup[click_F_pnu];
      document.getElementById("dddd03").value = inserted_record_rate_limsangdo[click_F_pnu];
      document.getElementById("dddd04").value = inserted_record_rate_bojunmount[click_F_pnu];
      document.getElementById("dddd05").value = inserted_record_dist_kyungji[click_F_pnu];
      document.getElementById("input2").value = inserted_value_develop[click_F_pnu];
      document.getElementById("input3").value = inserted_value_conserv[click_F_pnu];
      document.getElementById("input4").value = inserted_value_comp[click_F_pnu];
    }

    // // 합산 함수 호출
    // calculateDevVal();
    // calculateConVal();

    // 팝업 표시
    const selectedFeature = vectorSource
      .getFeatures()
      .find((feature) => feature.get("jibun") === click_F_Jibun);
    if (selectedFeature) {
      document.getElementById("info-title").innerHTML = click_F_Jibun;
      document.getElementById("info01").innerHTML =
        "지목: " + click_F_lndcgr_code_nm;
      document.getElementById("info02").innerHTML =
        "면적: " + click_F_lndpcl_ar + "㎡";
      document.getElementById("info03").innerHTML =
        "용도지역: " + click_F_prpos_area_1_nm;
      document.getElementById("info04").innerHTML =
        "토지형태: " + click_F_tpgrph_frm_code;
      document.getElementById("info05").innerHTML =
        "도로인접면: " + click_F_road_side_code_nm;

      if (centers2[emdid]) {
        const selectedCenter = centers2[emdid];
        overlay.setPosition(selectedCenter);
      } else {
        console.log("Selected center not found in centers object");
      }
    }
  };

  document.getElementById("searchData").onclick = fetchDataAndDisplay;

  // 입력 버튼 클릭시 작성한 지표값 db에 저장
  document.getElementById("insertData").onclick = () => {
    const aaaa01_value = document.getElementById("aaaa01").value;
    const aaaa02_value = document.getElementById("aaaa02").value;
    const aaaa03_value = document.getElementById("aaaa03").value;
    const aaaa04_value = document.getElementById("aaaa04").value;
    const bbbb01_value = document.getElementById("bbbb01").value;
    const bbbb02_value = document.getElementById("bbbb02").value;
    const bbbb03_value = document.getElementById("bbbb03").value;
    const cccc01_value = document.getElementById("cccc01").value;
    const cccc02_value = document.getElementById("cccc02").value;
    const cccc03_value = document.getElementById("cccc03").value;
    const cccc04_value = document.getElementById("cccc04").value;
    const dddd01_value = document.getElementById("dddd01").value;
    const dddd02_value = document.getElementById("dddd02").value;
    const dddd03_value = document.getElementById("dddd03").value;
    const dddd04_value = document.getElementById("dddd04").value;
    const dddd05_value = document.getElementById("dddd05").value;
    const input2_value = document.getElementById("input2").value;
    const input3_value = document.getElementById("input3").value;
    const input4_value = document.getElementById("input4").value;

    inserted_record_slope[click_F_pnu] = aaaa01_value;
    inserted_record_height[click_F_pnu] = aaaa02_value;
    inserted_record_dist_gi_str[click_F_pnu] = aaaa03_value;
    inserted_record_dist_gong_ntwk[click_F_pnu] = aaaa04_value;
    inserted_record_rate_city[click_F_pnu] = bbbb01_value;
    inserted_record_rate_city_touch[click_F_pnu] = bbbb02_value;
    inserted_record_dist_road[click_F_pnu] = bbbb03_value;
    inserted_record_rate_kyungji[click_F_pnu] = cccc01_value;
    inserted_record_rate_saengtae[click_F_pnu] = cccc02_value;
    inserted_record_rate_gongjuck[click_F_pnu] = cccc03_value;
    inserted_record_dist_gongjuck[click_F_pnu] = cccc04_value;
    inserted_record_rate_jdgarea[click_F_pnu] = dddd01_value;
    inserted_record_rate_nongup[click_F_pnu] = dddd02_value;
    inserted_record_rate_limsangdo[click_F_pnu] = dddd03_value;
    inserted_record_rate_bojunmount[click_F_pnu] = dddd04_value;
    inserted_record_dist_kyungji[click_F_pnu] = dddd05_value;
    inserted_value_develop[click_F_pnu] = input2_value;
    inserted_value_conserv[click_F_pnu] = input3_value;
    inserted_value_comp[click_F_pnu] = input4_value;


    // 선택된 지번과 레이어 정보 저장
    localStorage.setItem("click_F_pnu", click_F_pnu);
    localStorage.setItem("inserted_tpgrph_hg_code_nm", JSON.stringify(inserted_tpgrph_hg_code_nm));
    localStorage.setItem("inserted_record_slope", JSON.stringify(inserted_record_slope));
    localStorage.setItem("inserted_record_height", JSON.stringify(inserted_record_height));
    localStorage.setItem("inserted_record_dist_gi_str", JSON.stringify(inserted_record_dist_gi_str));
    localStorage.setItem("inserted_record_dist_gong_ntwk", JSON.stringify(inserted_record_dist_gong_ntwk));
    localStorage.setItem("inserted_record_rate_city", JSON.stringify(inserted_record_rate_city));
    localStorage.setItem("inserted_record_rate_city_touch", JSON.stringify(inserted_record_rate_city_touch));
    localStorage.setItem("inserted_record_dist_road", JSON.stringify(inserted_record_dist_road));
    localStorage.setItem("inserted_record_rate_kyungji", JSON.stringify(inserted_record_rate_kyungji));
    localStorage.setItem("inserted_record_rate_saengtae", JSON.stringify(inserted_record_rate_saengtae));
    localStorage.setItem("inserted_record_rate_gongjuck", JSON.stringify(inserted_record_rate_gongjuck));
    localStorage.setItem("inserted_record_dist_gongjuck", JSON.stringify(inserted_record_dist_gongjuck));
    localStorage.setItem("inserted_record_rate_jdgarea", JSON.stringify(inserted_record_rate_jdgarea));
    localStorage.setItem("inserted_record_rate_nongup", JSON.stringify(inserted_record_rate_nongup));
    localStorage.setItem("inserted_record_rate_limsangdo", JSON.stringify(inserted_record_rate_limsangdo));
    localStorage.setItem("inserted_record_rate_bojunmount", JSON.stringify(inserted_record_rate_bojunmount));
    localStorage.setItem("inserted_record_dist_kyungji", JSON.stringify(inserted_record_dist_kyungji));
    localStorage.setItem("inserted_value_develop", JSON.stringify(inserted_value_develop));
    localStorage.setItem("inserted_value_conserv", JSON.stringify(inserted_value_conserv));
    localStorage.setItem("inserted_value_comp", JSON.stringify(inserted_value_comp));

    sendData(click_F_pnu, aaaa01_value, aaaa02_value, aaaa03_value, aaaa04_value, bbbb01_value, bbbb02_value, bbbb03_value, cccc01_value, cccc02_value, cccc03_value, cccc04_value, dddd01_value, dddd02_value, dddd03_value, dddd04_value, dddd05_value, input2_value, input3_value, input4_value);
  };

  // 서버로 데이터 전송
  function sendData(click_F_pnu, inserted_record_slope, inserted_record_height, inserted_record_dist_gi_str, inserted_record_dist_gong_ntwk, inserted_record_rate_city, inserted_record_rate_city_touch, inserted_record_dist_road, inserted_record_rate_kyungji, inserted_record_rate_saengtae, inserted_record_rate_gongjuck, inserted_record_dist_gongjuck, inserted_record_rate_jdgarea, inserted_record_rate_nongup, inserted_record_rate_limsangdo, inserted_record_rate_bojunmount, inserted_record_dist_kyungji, inserted_value_develop, inserted_value_conserv, inserted_value_comp) {
    var url =
      `./fetchData.jsp?selected_pnu=${encodeURIComponent(click_F_pnu)}&inserted_record_slope=${encodeURIComponent(inserted_record_slope)}&inserted_record_height=${encodeURIComponent(inserted_record_height)}&inserted_record_dist_gi_str=${encodeURIComponent(inserted_record_dist_gi_str)}&inserted_record_dist_gong_ntwk=${encodeURIComponent(inserted_record_dist_gong_ntwk)}&inserted_record_rate_city=${encodeURIComponent(inserted_record_rate_city)}&inserted_record_rate_city_touch=${encodeURIComponent(inserted_record_rate_city_touch)}&inserted_record_dist_road=${encodeURIComponent(inserted_record_dist_road)}&inserted_record_rate_kyungji=${encodeURIComponent(inserted_record_rate_kyungji)}&inserted_record_rate_saengtae=${encodeURIComponent(inserted_record_rate_saengtae)}&inserted_record_rate_gongjuck=${encodeURIComponent(inserted_record_rate_gongjuck)}&inserted_record_dist_gongjuck=${encodeURIComponent(inserted_record_dist_gongjuck)}&inserted_record_rate_jdgarea=${encodeURIComponent(inserted_record_rate_jdgarea)}&inserted_record_rate_nongup=${encodeURIComponent(inserted_record_rate_nongup)}&inserted_record_rate_limsangdo=${encodeURIComponent(inserted_record_rate_limsangdo)}&inserted_record_rate_bojunmount=${encodeURIComponent(inserted_record_rate_bojunmount)}&inserted_record_dist_kyungji=${encodeURIComponent(inserted_record_dist_kyungji)}&inserted_value_develop=${encodeURIComponent(inserted_value_develop)}&inserted_value_conserv=${encodeURIComponent(inserted_value_conserv)}&inserted_value_comp=${encodeURIComponent(inserted_value_comp)}`;
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



  // aaaa01 ~ aaaa04, bbbb01 ~ bbbb05의 값을 합산하여 devVal에 설정하는 함수
  function calculateDevVal() {
    // 필수 지표 값 가져오기
    const requiredDevValues = ["aaaa01", "aaaa02", "aaaa03", "aaaa04"].map(
      (id) => parseFloat(document.getElementById(id).value) || 0
    );

    // 선택된 선택지표 값 가져오기
    const selectedDevCheckboxes = document.querySelectorAll(".dev-checkbox:checked");
    const selectedDevValues = Array.from(selectedDevCheckboxes).map(
      (checkbox) => {
        const valueId = "bbbb" + checkbox.id.slice(-2); // Get the corresponding input field id
        return parseFloat(document.getElementById(valueId).value) || 0;
      }
    );

    const devVal = requiredDevValues
      .concat(selectedDevValues)
      .reduce((acc, val) => acc + val, 0);

    document.getElementById("devVal").value = devVal;
    document.getElementById("input2").value = devVal;
    calculateResultVal(); // input2 변경 시 input4도 갱신
  }

  // cccc01 ~ cccc04, dddd01 ~ dddd05의 값을 합산하여 conVal에 설정하는 함수
  function calculateConVal() {
    // 필수 지표 값 가져오기
    const requiredConValues = ["cccc01", "cccc02", "cccc03", "cccc04"].map(
      (id) => parseFloat(document.getElementById(id).value) || 0
    );

    // 선택된 선택지표 값 가져오기
    const selectedConCheckboxes = document.querySelectorAll(".con-checkbox:checked");
    const selectedConValues = Array.from(selectedConCheckboxes).map(
      (checkbox) => {
        const valueId = "dddd" + checkbox.id.slice(-2); // Get the corresponding input field id
        return parseFloat(document.getElementById(valueId).value) || 0;
      }
    );

    const conVal = requiredConValues
      .concat(selectedConValues)
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
  ["bbbb01", "bbbb02", "bbbb03"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateDevVal);
  });
  ["cccc01", "cccc02", "cccc03", "cccc04"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateConVal);
  });
  ["dddd01", "dddd02", "dddd03", "dddd04", "dddd05"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateConVal);
  });

  // 체크박스 변경 이벤트 리스너 추가
  document.querySelectorAll(".dev-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", calculateDevVal);
  });

  document.querySelectorAll(".con-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", calculateConVal);
  });













  // 삭제 버튼 클릭시 경고창 표시 -> 확인 취소 구분
  document.getElementById('deleteData').addEventListener('click', function () {
    const confirmation = confirm('점수를 삭제하시겠습니까?');
    if (confirmation) { // 확인 버튼 눌렀을때

      console.log("inserted_tpgrph_hg_code_nm is not null for current pnu");



      localStorage.setItem("click_F_pnu", click_F_pnu);
      deleteData(click_F_pnu);
    }
  });
  function deleteData(click_F_pnu) {
    console.log("점수 삭제 완료");
    var url =
      `./deleteData.jsp?selected_pnu=${encodeURIComponent(click_F_pnu)}`;
    fetch(url, {
      method: "POST",
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Response from server:", data);
        const zero = 0;
        document.getElementById("aaaa01").value = zero;
        document.getElementById("aaaa02").value = zero;
        document.getElementById("aaaa03").value = zero;
        document.getElementById("aaaa04").value = zero;
        document.getElementById("bbbb01").value = zero;
        document.getElementById("bbbb02").value = zero;
        document.getElementById("bbbb03").value = zero;
        document.getElementById("cccc01").value = zero;
        document.getElementById("cccc02").value = zero;
        document.getElementById("cccc03").value = zero;
        document.getElementById("cccc04").value = zero;
        document.getElementById("dddd01").value = zero;
        document.getElementById("dddd02").value = zero;
        document.getElementById("dddd03").value = zero;
        document.getElementById("dddd04").value = zero;
        document.getElementById("dddd05").value = zero;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // 체크박스 선택 제한 함수
  function limitCheckboxSelection(checkboxClass, limit) {
    const checkboxes = document.querySelectorAll(`.${checkboxClass}`);
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        const checkedCheckboxes = document.querySelectorAll(`.${checkboxClass}:checked`);
        // 합산 함수 호출
        calculateDevVal();
        calculateConVal();
        if (checkedCheckboxes.length > limit) {
          this.checked = false;
          alert(`최대 ${limit}개까지 선택할 수 있습니다.`);
        }
      });
    });
  }

  // 선택지표에 대한 체크박스 선택 제한
  limitCheckboxSelection('dev-checkbox', 2);
  limitCheckboxSelection('con-checkbox', 2);



  // HWPX 파일 생성 함수
  function createHWPXContent(data) {
    return `
    지번: ${data.jibun}
    개발적성값 (A): ${data.devVal}
    보전적성값 (B): ${data.conservVal}
    종합적성값 (C): ${data.compVal}
    <!-- 추가적인 데이터 -->

  `;
  }
  // 데이터를 수집하는 함수
  function collectData() {
    const data = {
      jibun: document.getElementById('selectedValueDisplay2').textContent,
      devVal: document.getElementById('input2').value,
      conservVal: document.getElementById('input3').value,
      compVal: document.getElementById('input4').value,
      // 추가적인 데이터는 여기서 수집
    };
    return data;
  }

  // HWPX 파일 다운로드 함수
  function downloadHWPX(content, fileName) {
    const blob = new Blob([content], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  // HWPX 파일 생성 버튼 클릭 이벤트 추가
  document.getElementById('generateHWPX').addEventListener('click', () => {
    const data = collectData();
    const hwpxContent = createHWPXContent(data);
    downloadHWPX(hwpxContent, '토지적성평가.hwpx');
  });

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

// // aaaa01 ~ aaaa04, bbbb01 ~ bbbb05의 값을 합산하여 devVal에 설정하는 함수
// function calculateDevVal() {
//   const selectedDevCheckboxes = document.querySelectorAll(".dev-checkbox:checked");
//   const selectedDevValues = Array.from(selectedDevCheckboxes).map(
//     (checkbox) => {
//       const valueId = "bbbb" + checkbox.id.slice(-2); // Get the corresponding input field id
//       return parseFloat(document.getElementById(valueId).value) || 0;
//     }
//   );

//   const devVal = selectedDevValues.reduce((acc, val) => acc + val, 0);

//   document.getElementById("devVal").value = devVal;
//   document.getElementById("input2").value = devVal;
//   calculateResultVal(); // input2 변경 시 input4도 갱신
// }

// // cccc01 ~ cccc04, dddd01 ~ dddd05의 값을 합산하여 conVal에 설정하는 함수
// function calculateConVal() {
//   const selectedConCheckboxes = document.querySelectorAll(".con-checkbox:checked");
//   const selectedConValues = Array.from(selectedConCheckboxes).map(
//     (checkbox) => {
//       const valueId = "dddd" + checkbox.id.slice(-2); // Get the corresponding input field id
//       return parseFloat(document.getElementById(valueId).value) || 0;
//     }
//   );

//   const conVal = selectedConValues.reduce((acc, val) => acc + val, 0);

//   document.getElementById("conVal").value = conVal;
//   document.getElementById("input3").value = conVal;
//   calculateResultVal(); // input3 변경 시 input4도 갱신
// }

// // input2와 input3의 값을 계산하여 input4에 설정하는 함수
// function calculateResultVal() {
//   const devVal = parseFloat(document.getElementById("input2").value) || 0;
//   const conVal = parseFloat(document.getElementById("input3").value) || 0;
//   const resultVal = devVal - conVal;
//   document.getElementById("input4").value = resultVal;
// }

// // 이벤트 리스너 추가
// ["aaaa01", "aaaa02", "aaaa03", "aaaa04"].forEach((id) => {
//   document.getElementById(id).addEventListener("input", calculateDevVal);
// });
// ["bbbb01", "bbbb02", "bbbb03"].forEach((id) => {
//   document.getElementById(id).addEventListener("input", calculateDevVal);
// });
// ["cccc01", "cccc02", "cccc03", "cccc04"].forEach((id) => {
//   document.getElementById(id).addEventListener("input", calculateConVal);
// });
// ["dddd01", "dddd02", "dddd03", "dddd04", "dddd05"].forEach((id) => {
//   document.getElementById(id).addEventListener("input", calculateConVal);
// });

//  // 체크박스 변경 이벤트 리스너 추가
// document.querySelectorAll(".dev-checkbox").forEach((checkbox) => {
//   checkbox.addEventListener("change", calculateDevVal);
// });

// document.querySelectorAll(".con-checkbox").forEach((checkbox) => {
//   checkbox.addEventListener("change", calculateConVal);
// });

// // 초기 계산
// calculateDevVal();
// calculateConVal();

