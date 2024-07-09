import "./style.css";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style, Circle } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Map, Overlay, View } from "ol";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { Select, Draw } from "ol/interaction.js";
import Feature from "ol/Feature.js";

var vectorLayer;
var vectorLayer2;
var vectorLayer3;
var vectorSource;
var vectorSource2;
var vectorSource3;
var selectLayer;
let overlay;
let overlay2;
var emdid = {};

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

// 팝업창 위치 설정... 해당 지역 우측으로
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

// 읍면동 레이어에 대한 부분(여러 읍면동을 선택할 수 있도록 설정)
function makeFilter1(methods) {
  let filter1 = "";
  if (!Array.isArray(methods)) {
    methods = Array.from(methods);
  }
  methods.forEach((method, index) => {
    if (index > 0) {
      filter1 += " or ";
    }
    let filterValue = "";
    if (method === "emd00") filterValue = "무안군";
    else if (method === "emd01") filterValue = "망운면";
    else if (method === "emd02") filterValue = "몽탄면";
    else if (method === "emd03") filterValue = "무안읍";
    else if (method === "emd04") filterValue = "삼향읍";
    else if (method === "emd05") filterValue = "운남면";
    else if (method === "emd06") filterValue = "일로읍";
    else if (method === "emd07") filterValue = "청계면";
    else if (method === "emd08") filterValue = "해제면";
    else if (method === "emd09") filterValue = "현경면";
    // 다 더해서 쿼리 완성
    filter1 += `"ld_cpsgemd_nm" like '%${filterValue}%'`;
  });
  return filter1;
}

// 직접 그린 폴리곤 레이어 부분
vectorSource3 = new VectorSource({
  url: "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:polygon_data&outputFormat=application/json",
  format: new GeoJSON(),
});
vectorLayer3 = new VectorLayer({
  source: vectorSource3,
  style: styleFunction,
});

// 읍면동 레이어에 대한 부분
vectorSource2 = new VectorSource({
  url: "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:muan_emd&&outputFormat=application/json",
  format: new GeoJSON(),
});

vectorLayer2 = new VectorLayer({
  source: vectorSource2,
  style: new Style({
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.3)",
    }),
    stroke: new Stroke({
      color: "rgba(70, 0, 0, 1)",
      width: 1.5,
    }),
  }),
});

// 읍면동 선택된 연속도 레이어에 대한 부분
function makeFilter(click_F_Jibun) {
  let filter = "jibun = '";
  filter += click_F_Jibun + "'";
  return filter;
}
function makeWFSSource2(click_F_Jibun) {
  vectorSource3 = new VectorSource({
    url: encodeURI(
      "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan&outputFormat=application/json&CQL_FILTER=" +
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
      width: 1,
    }),
  }),
});

var vectorSource = new VectorSource(); // 기본 빈 값으로 초기화

// 읍면동 선택에 따라 vectorSource를 업데이트하는 함수
function updateVectorSource(methods) {
  if (methods && methods.length > 0) {
    vectorSource = new VectorSource({
      url: encodeURI(
        "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:combined_muan&outputFormat=application/json&CQL_FILTER=" +
        makeFilter1(methods)
      ),
      format: new GeoJSON(),
    });
    if (vectorLayer) {
      vectorLayer.setSource(vectorSource);
      vectorLayer.setVisible(true);
    }
  }
}

function makeWFSSource(methods) {
  // methods가 배열이 아닌 경우 배열로 변환
  if (!Array.isArray(methods)) {
    methods = Array.from(methods);
  }
  updateVectorSource(methods);

  // 좌표들의 평균 계산... 읍면동 다중 선택시 그 중간으로 중심 이동
  let sumX = 0;
  let sumY = 0;
  methods.forEach(method => {
    const center = centers[method];
    sumX += center[0];
    sumY += center[1];
  });
  const avgX = sumX / methods.length;
  const avgY = sumY / methods.length;
  const avgCenter = [avgX, avgY];

  // 지도 중심 및 확대 수준 설정
  const view = map.getView();
  let zoomLevel = methods.includes("emd00") ? 11 : 12.5; // emd00인 경우 zoomLevel을 11로 설정
  view.animate({
    center: avgCenter,
    zoom: zoomLevel,
    duration: 1000, // 1초 동안 애니메이션
  });
}

// 종합적성값 구간별 색상 넣는 레이어 생성
function styleFunction(feature) {
  var value = feature.get('value_comp');
  var color;
  if (value < -360) {
    color = "rgba(0, 78, 0, 1.0)";
  } else if (value < -120) {
    color = "rgba(0, 200, 0, 1.0)";
  } else if (value < 120) {
    color = "rgba(255, 211, 0, 1.0)";
  } else if (value < 360) {
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
      width: 0.3
    })
  });
}

vectorLayer = new VectorLayer({ // 필지별 지적도 레이어
  source: null, // 초기에는 소스를 설정하지 않음
  visible: false, // 초기에는 보이지 않도록 설정
  style: new Style({
    stroke: new Stroke({
      color: "rgba(0, 153, 051, 0.5)",
      width: 0.5,
    }),
  }),
});

// 위성지도 레이어
const satelliteLayer = new Tile({
  source: new XYZ({
    url: 'https://www.google.com/maps/vt?lyrs=s&x={x}&y={y}&z={z}&hl=ko&gl=US&key=AIzaSyB5IFWyH-vY37Dm7gV5OO6CXWN3084dwnQ'
  })
});

// 일반지도 레이어
const osmLayer = new Tile({
  source: new OSM()
});

// 직접 그린 폴리곤 레이어
const DrawSource = new VectorSource({ wrapX: false });

const DrawVector = new VectorLayer({
  source: DrawSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(212, 194, 92, 0.2)",
    }),
    stroke: new Stroke({
      color: "#8b6900",
      width: 0.5,
    }),
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: "#8b6900",
      }),
    }),
  }),
});

// 영역을 그려 선택된 연속도 레이어
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
    info.style.left = pixel[0] + "px";
    info.style.top = pixel[1] + "px";
    if (feature !== currentFeature) {
      info.style.visibility = "visible";
      info.innerText = feature.get("jibun");
      currentFeature = feature;
    }
  } else if (currentFeature) {
    // feature가 없지만 currentFeature가 존재하는 경우
    info.style.visibility = "hidden";
    currentFeature = null; // currentFeature 초기화
  }
};
const popup = document.getElementById("popup");
const polyPopup = document.getElementById("polygonPopup");

// 그린 폴리곤에 대한 팝업
overlay2 = new Overlay({
  element: polyPopup,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

// 조회시 나타나는 기본 정보 팝업
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
    osmLayer,
    vectorLayer2,
    vectorLayer,
    selectLayer,
    SelectionsVector,
    DrawVector,
    vectorLayer3,
  ],
  overlays: [overlay, overlay2],
  target: "map",
  view: new View({
    center: initialCenter,
    maxZoom: 19,
    zoom: initialZoom,
  }),
});

// 영역을 그려 선택된 연속도 레이어 스타일
const selectedStyle = new Style({
  fill: new Fill({
    color: "rgba(153, 51, 0, 0.9)",
  }),
  stroke: new Stroke({
    color: "rgba(153, 51, 0, 0.9)",
    width: 0.3,
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

// DrawVector를 서버로 전송하는 파트
document.addEventListener("DOMContentLoaded", function () {
  let geometryGeoJSON = null;
  let area = null;
  let round = null;
  let drawnFeature = null;

  draw.on("drawend", function (e) {
    DrawSource.clear();
    SelectionsSource.clear();
    const extent = e.feature.getGeometry().getExtent();
    const geomA = e.feature.getGeometry();

    geometryGeoJSON = new GeoJSON().writeGeometry(geomA);
    drawnFeature = e.feature;

    // vectorSource가 정의되었는지 확인
    if (vectorSource && vectorSource.getFeatures().length > 0) {
      // 마우스로 그린 영역과 지도 간의 인터섹트 수행
      vectorSource.forEachFeatureInExtent(extent, function (aa) {
        if (polyIntersectsPoly(geomA, aa.getGeometry()) === true) {
          SelectionsSource.addFeature(aa);
          selectedFeatures.push(aa);
        }
      });
    }
  });

  // DrawVector 레이어에 말풍선 표시... vectorLayer3와 통합 필요
  const tooltipDraw = document.createElement('div');
  tooltipDraw.id = 'tooltipDraw';
  document.body.appendChild(tooltipDraw);

  // vectorLayer3 레이어에 말풍선 표시
  const tooltipVector3 = document.createElement('div');
  tooltipVector3.id = 'tooltipVector3';
  document.body.appendChild(tooltipVector3);

  // DrawVector 레이어에 대한 마우스 이동 이벤트 리스너
  map.on('pointermove', function (event) {
    const hit = map.hasFeatureAtPixel(event.pixel, {
      layerFilter: function (layer) {
        return layer === DrawVector;
      }
    });
    if (hit) {
      const pixel = event.pixel;
      const mapRect = map.getTargetElement().getBoundingClientRect();
      tooltipDraw.style.display = 'block';
      tooltipDraw.style.left = `${pixel[0] + mapRect.left}px`;
      tooltipDraw.style.top = `${pixel[1] + mapRect.top - 40}px`;
      tooltipDraw.innerHTML = 'Ctrl+클릭';
    } else {
      tooltipDraw.style.display = 'none';
    }
  });

  // vectorLayer3 레이어에 대한 마우스 이동 이벤트 리스너
  map.on('pointermove', function (event) {
    const hit = map.hasFeatureAtPixel(event.pixel, {
      layerFilter: function (layer) {
        return layer === vectorLayer3;
      }
    });
    if (hit) {
      const pixel = event.pixel;
      const mapRect = map.getTargetElement().getBoundingClientRect();
      tooltipVector3.style.display = 'block';
      tooltipVector3.style.left = `${pixel[0] + mapRect.left}px`;
      tooltipVector3.style.top = `${pixel[1] + mapRect.top - 40}px`;
      tooltipVector3.innerHTML = 'Ctrl+클릭';
    } else {
      tooltipVector3.style.display = 'none';
    }
  });

  // 마우스가 지도에서 벗어났을 때 말풍선 숨기기
  map.on('pointerout', function () {
    tooltipDraw.style.display = 'none';
    tooltipVector3.style.display = 'none';
  });

  // Ctrl+클릭 이벤트 핸들러 추가
  map.on('click', function (evt) {
    overlay.setPosition(undefined);
    overlay2.setPosition(undefined);
    if (!evt.originalEvent.ctrlKey) {
      return; // Ctrl 키가 눌리지 않았으면 아무 작업도 하지 않음
    }
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      if (feature.getGeometry().getType() === 'Polygon') {
        const coordinates = feature.getGeometry().getCoordinates();
        const center = ol.extent.getCenter(feature.getGeometry().getExtent());
        const area1 = feature.getGeometry().getArea();
        const linearRing = new ol.geom.LineString(coordinates[0]);
        const round1 = linearRing.getLength();

        area = Math.round(area1);
        round = Math.round(round1);

        // 폴리곤 클릭시 정보 -> 초기에는 빈 값으로 정의.. 삼항연산자 사용
        const developValue = feature.get('develop_value') !== undefined ? feature.get('develop_value') : '빈값';
        const conserveValue = feature.get('conserve_value') !== undefined ? feature.get('conserve_value') : '빈값';
        const compreValue = feature.get('value_comp') !== undefined ? feature.get('value_comp') : '빈값';
        const slope_poly = feature.get('slope_poly') !== undefined ? feature.get('slope_poly') : '빈값';
        const height_poly = feature.get('height_poly') !== undefined ? feature.get('height_poly') : '빈값';
        const dist_gi_str_poly = feature.get('dist_gi_str_poly') !== undefined ? feature.get('dist_gi_str_poly') : '빈값';
        const dist_gong_ntwk_poly = feature.get('dist_gong_ntwk_poly') !== undefined ? feature.get('dist_gong_ntwk_poly') : '빈값';
        const rate_city_poly = feature.get('rate_city_poly') !== undefined ? feature.get('rate_city_poly') : '빈값';
        const rate_city_touch_poly = feature.get('rate_city_touch_poly') !== undefined ? feature.get('rate_city_touch_poly') : '빈값';
        const dist_road_touch_poly = feature.get('dist_road_touch_poly') !== undefined ? feature.get('dist_road_touch_poly') : '빈값';
        const rate_kyungji_poly = feature.get('rate_kyungji_poly') !== undefined ? feature.get('rate_kyungji_poly') : '빈값';
        const rate_saengtae_poly = feature.get('rate_saengtae_poly') !== undefined ? feature.get('rate_saengtae_poly') : '빈값';
        const rate_gongjuck_poly = feature.get('rate_gongjuck_poly') !== undefined ? feature.get('rate_gongjuck_poly') : '빈값';
        const dist_gongjuck_poly = feature.get('dist_gongjuck_poly') !== undefined ? feature.get('dist_gongjuck_poly') : '빈값';
        const rate_jdgarea_poly = feature.get('rate_jdgarea_poly') !== undefined ? feature.get('rate_jdgarea_poly') : '빈값';
        const rate_nongup_poly = feature.get('rate_nongup_poly') !== undefined ? feature.get('rate_nongup_poly') : '빈값';
        const rate_limsangdo_poly = feature.get('rate_limsangdo_poly') !== undefined ? feature.get('rate_limsangdo_poly') : '빈값';
        const rate_bojunmount_poly = feature.get('rate_bojunmount_poly') !== undefined ? feature.get('rate_bojunmount_poly') : '빈값';
        const dist_kyungji_poly = feature.get('dist_kyungji_poly') !== undefined ? feature.get('dist_kyungji_poly') : '빈값';
        // index.html로 넘겨줄 값들
        document.getElementById("polygon-info").innerHTML = "폴리곤 정보";
        document.getElementById("polyinfo01").innerHTML = "면적: " + (area / 1000000).toFixed(2) + " ㎢";
        document.getElementById("polyinfo02").innerHTML = "둘레: " + (round / 1000).toFixed(2) + " ㎞";
        document.getElementById("polyDevinfo01").innerHTML = "경사도: " + slope_poly;
        document.getElementById("polyDevinfo02").innerHTML = "표고: " + height_poly;
        document.getElementById("polyDevinfo03").innerHTML = "기개발지거리: " + dist_gi_str_poly;
        document.getElementById("polyDevinfo04").innerHTML = "공공편익시설거리: " + dist_gong_ntwk_poly;
        document.getElementById("polyDevinfo05").innerHTML = "도시용지비율: " + rate_city_poly;
        document.getElementById("polyDevinfo06").innerHTML = "도시용지인접비율: " + rate_city_touch_poly;
        document.getElementById("polyDevinfo07").innerHTML = "도로인접거리: " + dist_road_touch_poly;
        document.getElementById("polyConvinfo01").innerHTML = "경지정리면적비율: " + rate_kyungji_poly;
        document.getElementById("polyConvinfo02").innerHTML = "생태자연상위비율: " + rate_saengtae_poly;
        document.getElementById("polyConvinfo03").innerHTML = "공적규제면적비율: " + rate_gongjuck_poly;
        document.getElementById("polyConvinfo04").innerHTML = "공적규제지역거리: " + dist_gongjuck_poly;
        document.getElementById("polyConvinfo05").innerHTML = "전답과수원비율: " + rate_jdgarea_poly;
        document.getElementById("polyConvinfo06").innerHTML = "농업진흥지역비율: " + rate_nongup_poly;
        document.getElementById("polyConvinfo07").innerHTML = "임상도상위비율: " + rate_limsangdo_poly;
        document.getElementById("polyConvinfo08").innerHTML = "보전산지비율: " + rate_bojunmount_poly;
        document.getElementById("polyConvinfo09").innerHTML = "경지정리지역거리: " + dist_kyungji_poly;
        document.getElementById("polyinfo03").innerHTML = "개발적성값: " + developValue;
        document.getElementById("polyinfo04").innerHTML = "보전적성값: " + conserveValue;
        document.getElementById("polyinfo05").innerHTML = "종합적성값: " + compreValue;

        // 팝업창을 띄움
        overlay2.setPosition(center);
        // 선택된 feature의 geometryGeoJSON을 업데이트
        geometryGeoJSON = new GeoJSON().writeGeometry(feature.getGeometry());
        drawnFeature = feature; // 선택된 피처를 drawnFeature로 설정
      }
    });
  });

  // drawVector 팝업창에 있는 값을 가져와서 서버로 전송하는 코드(입력)
  document.getElementById("insertPoly").onclick = () => {
    // 체크박스가 선택되지 않은 값들을 0으로 설정
    for (let i = 5; i <= 7; i++) {
      const checkbox = document.getElementById(`check_polyDevdata0${i}`);
      const input = document.getElementById(`polyDevdata0${i}`);
      if (checkbox && !checkbox.checked && input) {
        input.value = '0';
      }
    }
    for (let i = 5; i <= 9; i++) {
      const checkbox = document.getElementById(`check_polyConvdata0${i}`);
      const input = document.getElementById(`polyConvdata0${i}`);
      if (checkbox && !checkbox.checked && input) {
        input.value = '0';
      }
    }
    const index = '1'; // 인덱스가 1 이면 jsp에서 insert 처리
    const slope_poly = document.getElementById("polyDevdata01").value;
    const height_poly = document.getElementById("polyDevdata02").value;
    const dist_gi_str_poly = document.getElementById("polyDevdata03").value;
    const dist_gong_ntwk_poly = document.getElementById("polyDevdata04").value;
    const rate_city_poly = document.getElementById("polyDevdata05").value;
    const rate_city_touch_poly = document.getElementById("polyDevdata06").value;
    const dist_road_touch_poly = document.getElementById("polyDevdata07").value;
    const rate_kyungji_poly = document.getElementById("polyConvdata01").value;
    const rate_saengtae_poly = document.getElementById("polyConvdata02").value;
    const rate_gongjuck_poly = document.getElementById("polyConvdata03").value;
    const dist_gongjuck_poly = document.getElementById("polyConvdata04").value;
    const rate_jdgarea_poly = document.getElementById("polyConvdata05").value;
    const rate_nongup_poly = document.getElementById("polyConvdata06").value;
    const rate_limsangdo_poly = document.getElementById("polyConvdata07").value;
    const rate_bojunmount_poly = document.getElementById("polyConvdata08").value;
    const dist_kyungji_poly = document.getElementById("polyConvdata09").value;
    const developValue = document.getElementById("polydata03").value;
    const conserveValue = document.getElementById("polydata04").value;
    const compreValue = document.getElementById("polydata05").value;
    const geom = geometryGeoJSON;

    fetch(`./jsp/insertPolygon.jsp?index=${encodeURIComponent(index)}&area=${encodeURIComponent(area)}&round=${encodeURIComponent(round)}&slope_poly=${encodeURIComponent(slope_poly)}&height_poly=${encodeURIComponent(height_poly)}&dist_gi_str_poly=${encodeURIComponent(dist_gi_str_poly)}&dist_gong_ntwk_poly=${encodeURIComponent(dist_gong_ntwk_poly)}&rate_city_poly=${encodeURIComponent(rate_city_poly)}&rate_city_touch_poly=${encodeURIComponent(rate_city_touch_poly)}&dist_road_touch_poly=${encodeURIComponent(dist_road_touch_poly)}&rate_kyungji_poly=${encodeURIComponent(rate_kyungji_poly)}&rate_saengtae_poly=${encodeURIComponent(rate_saengtae_poly)}&rate_gongjuck_poly=${encodeURIComponent(rate_gongjuck_poly)}&dist_gongjuck_poly=${encodeURIComponent(dist_gongjuck_poly)}&rate_jdgarea_poly=${encodeURIComponent(rate_jdgarea_poly)}&rate_nongup_poly=${encodeURIComponent(rate_nongup_poly)}&rate_limsangdo_poly=${encodeURIComponent(rate_limsangdo_poly)}&rate_bojunmount_poly=${encodeURIComponent(rate_bojunmount_poly)}&dist_kyungji_poly=${encodeURIComponent(dist_kyungji_poly)}&developValue=${encodeURIComponent(developValue)}&conserveValue=${encodeURIComponent(conserveValue)}&compreValue=${encodeURIComponent(compreValue)}&geom=${encodeURIComponent(geom)}`, {
      method: 'POST',
    })
      .then(response => response.text())
      .then(data => {
        console.log('Response from server:', data);
        document.getElementById("polyDevinfo01").textContent = "경사도: " + slope_poly;
        document.getElementById("polyDevinfo02").textContent = "표고: " + height_poly;
        document.getElementById("polyDevinfo03").textContent = "기개발지거리: " + dist_gi_str_poly;
        document.getElementById("polyDevinfo04").textContent = "공편시설거리: " + dist_gong_ntwk_poly;
        document.getElementById("polyDevinfo05").textContent = "도시용지비율: " + rate_city_poly;
        document.getElementById("polyDevinfo06").textContent = "도시용지인접비율: " + rate_city_touch_poly;
        document.getElementById("polyDevinfo07").textContent = "도로인접거리: " + dist_road_touch_poly;
        document.getElementById("polyConvinfo01").textContent = "경지정리면적비율: " + rate_kyungji_poly;
        document.getElementById("polyConvinfo02").textContent = "생태자연도상위등급비율: " + rate_saengtae_poly;
        document.getElementById("polyConvinfo03").textContent = "공적규제지역면적비율: " + rate_gongjuck_poly;
        document.getElementById("polyConvinfo04").textContent = "공적규제지역과의거리: " + dist_gongjuck_poly;
        document.getElementById("polyConvinfo05").textContent = "전답과수원면적비율: " + rate_jdgarea_poly;
        document.getElementById("polyConvinfo06").textContent = "농업진흥지역비율: " + rate_nongup_poly;
        document.getElementById("polyConvinfo07").textContent = "임상도상위등급비율: " + rate_limsangdo_poly;
        document.getElementById("polyConvinfo08").textContent = "보전지역산지비율: " + rate_bojunmount_poly;
        document.getElementById("polyConvinfo09").textContent = "경지정리지역와의거리: " + dist_kyungji_poly;
        document.getElementById("polyinfo03").textContent = "개발적성값: " + developValue;
        document.getElementById("polyinfo04").textContent = "보전적성값: " + conserveValue;
        document.getElementById("polyinfo05").textContent = "종합적성값: " + compreValue;
      })
      .catch(error => {
        console.error('Error:', error);
      });

  };


  // 그린 폴리곤 팝업창에 있는 값을 가져와서 서버로 전송하는 코드(수정)
  document.getElementById("updatePoly").onclick = () => {
    // 체크박스 선택된 지표만 수정되도록 수정 필요
    const index = '2'; // 인덱스가 2 이면 jsp에서 update 처리
    const slope_poly = document.getElementById("polyDevdata01").value;
    const height_poly = document.getElementById("polyDevdata02").value;
    const dist_gi_str_poly = document.getElementById("polyDevdata03").value;
    const dist_gong_ntwk_poly = document.getElementById("polyDevdata04").value;
    const rate_city_poly = document.getElementById("polyDevdata05").value;
    const rate_city_touch_poly = document.getElementById("polyDevdata06").value;
    const dist_road_touch_poly = document.getElementById("polyDevdata07").value;
    const rate_kyungji_poly = document.getElementById("polyConvdata01").value;
    const rate_saengtae_poly = document.getElementById("polyConvdata02").value;
    const rate_gongjuck_poly = document.getElementById("polyConvdata03").value;
    const dist_gongjuck_poly = document.getElementById("polyConvdata04").value;
    const rate_jdgarea_poly = document.getElementById("polyConvdata05").value;
    const rate_nongup_poly = document.getElementById("polyConvdata06").value;
    const rate_limsangdo_poly = document.getElementById("polyConvdata07").value;
    const rate_bojunmount_poly = document.getElementById("polyConvdata08").value;
    const dist_kyungji_poly = document.getElementById("polyConvdata09").value;
    const developValue = document.getElementById("polydata03").value;
    const conserveValue = document.getElementById("polydata04").value;
    const compreValue = document.getElementById("polydata05").value;
    const geom = geometryGeoJSON;

    fetch(`./jsp/insertPolygon.jsp?index=${encodeURIComponent(index)}&area=${encodeURIComponent(area)}&round=${encodeURIComponent(round)}&slope_poly=${encodeURIComponent(slope_poly)}&height_poly=${encodeURIComponent(height_poly)}&dist_gi_str_poly=${encodeURIComponent(dist_gi_str_poly)}&dist_gong_ntwk_poly=${encodeURIComponent(dist_gong_ntwk_poly)}&rate_city_poly=${encodeURIComponent(rate_city_poly)}&rate_city_touch_poly=${encodeURIComponent(rate_city_touch_poly)}&dist_road_touch_poly=${encodeURIComponent(dist_road_touch_poly)}&rate_kyungji_poly=${encodeURIComponent(rate_kyungji_poly)}&rate_saengtae_poly=${encodeURIComponent(rate_saengtae_poly)}&rate_gongjuck_poly=${encodeURIComponent(rate_gongjuck_poly)}&dist_gongjuck_poly=${encodeURIComponent(dist_gongjuck_poly)}&rate_jdgarea_poly=${encodeURIComponent(rate_jdgarea_poly)}&rate_nongup_poly=${encodeURIComponent(rate_nongup_poly)}&rate_limsangdo_poly=${encodeURIComponent(rate_limsangdo_poly)}&rate_bojunmount_poly=${encodeURIComponent(rate_bojunmount_poly)}&dist_kyungji_poly=${encodeURIComponent(dist_kyungji_poly)}&developValue=${encodeURIComponent(developValue)}&conserveValue=${encodeURIComponent(conserveValue)}&compreValue=${encodeURIComponent(compreValue)}&geom=${encodeURIComponent(geom)}`, {
      method: 'POST',
    })
      .then(response => response.text())
      .then(data => {
        console.log('Response from server:', data);
        document.getElementById("polyDevinfo01").textContent = "경사도: " + slope_poly;
        document.getElementById("polyDevinfo02").textContent = "표고: " + height_poly;
        document.getElementById("polyDevinfo03").textContent = "기개발지거리: " + dist_gi_str_poly;
        document.getElementById("polyDevinfo04").textContent = "공편시설거리: " + dist_gong_ntwk_poly;
        document.getElementById("polyDevinfo05").textContent = "도시용지비율: " + rate_city_poly;
        document.getElementById("polyDevinfo06").textContent = "도시용지인접비율: " + rate_city_touch_poly;
        document.getElementById("polyDevinfo07").textContent = "도로인접거리: " + dist_road_touch_poly;
        document.getElementById("polyConvinfo01").textContent = "경지정리면적비율: " + rate_kyungji_poly;
        document.getElementById("polyConvinfo02").textContent = "생태자연도상위등급비율: " + rate_saengtae_poly;
        document.getElementById("polyConvinfo03").textContent = "공적규제지역면적비율: " + rate_gongjuck_poly;
        document.getElementById("polyConvinfo04").textContent = "공적규제지역과의거리: " + dist_gongjuck_poly;
        document.getElementById("polyConvinfo05").textContent = "전답과수원면적비율: " + rate_jdgarea_poly;
        document.getElementById("polyConvinfo06").textContent = "농업진흥지역비율: " + rate_nongup_poly;
        document.getElementById("polyConvinfo07").textContent = "임상도상위등급비율: " + rate_limsangdo_poly;
        document.getElementById("polyConvinfo08").textContent = "보전지역산지비율: " + rate_bojunmount_poly;
        document.getElementById("polyConvinfo09").textContent = "경지정리지역와의거리: " + dist_kyungji_poly;
        document.getElementById("polyinfo03").textContent = "개발적성값: " + developValue;
        document.getElementById("polyinfo04").textContent = "보전적성값: " + conserveValue;
        document.getElementById("polyinfo05").textContent = "종합적성값: " + compreValue;
        // alert('수정되었습니다');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  // 그린 폴리곤 팝업창에 있는 값을 가져와서 서버로 전송하는 코드(삭제)
  document.getElementById("deletePoly").onclick = () => {
    const index = '3'; // 인덱스가 3 이면 jsp에서 delete 처리
    fetch(`./jsp/insertPolygon.jsp?index=${encodeURIComponent(index)}&area=${encodeURIComponent(area)}`, {
      method: 'POST',
    })
      .then(response => response.text())
      .then(data => {
        console.log('Response from server:', data);
        document.getElementById("polyDevinfo01").textContent = "경사도: ";
        document.getElementById("polyDevinfo02").textContent = "표고: ";
        document.getElementById("polyDevinfo03").textContent = "기개발지거리: ";
        document.getElementById("polyDevinfo04").textContent = "공편시설거리: ";
        document.getElementById("polyDevinfo05").textContent = "도시용지비율: ";
        document.getElementById("polyDevinfo06").textContent = "도시용지인접비율: ";
        document.getElementById("polyDevinfo07").textContent = "도로인접거리: ";
        document.getElementById("polyConvinfo01").textContent = "경지정리면적비율: ";
        document.getElementById("polyConvinfo02").textContent = "생태자연도상위등급비율: ";
        document.getElementById("polyConvinfo03").textContent = "공적규제지역면적비율: ";
        document.getElementById("polyConvinfo04").textContent = "공적규제지역과의거리: ";
        document.getElementById("polyConvinfo05").textContent = "전답과수원면적비율: ";
        document.getElementById("polyConvinfo06").textContent = "농업진흥지역비율: ";
        document.getElementById("polyConvinfo07").textContent = "임상도상위등급비율: ";
        document.getElementById("polyConvinfo08").textContent = "보전지역산지비율: ";
        document.getElementById("polyConvinfo09").textContent = "경지정리지역와의거리: ";
        document.getElementById("polyinfo03").textContent = "개발적성값: ";
        document.getElementById("polyinfo04").textContent = "보전적성값: ";
        document.getElementById("polyinfo05").textContent = "종합적성값: ";
        // alert('삭제되었습니다');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
});

///////////////////////////////////////////////////////////////

// 인터섹트 함수... drawVector와 vectorLayer3 간의 인터섹트 수행
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

// 지도 전환 버튼 이벤트 리스너
document.getElementById("switch-to-osm").addEventListener("click", function () {
  map.getLayers().setAt(0, osmLayer);
});

document.getElementById("switch-to-satellite").addEventListener("click", function () {
  map.getLayers().setAt(0, satelliteLayer);
});

document.addEventListener("DOMContentLoaded", function () {
  // 콤보박스 파트
  const elementIds = [
    "aaa01", "aaa02", "aaa03", "aaa04",
    "bbb01", "bbb04", "bbb02", "bbb03",
    "ccc01", "ccc02", "ccc03", "ccc04",
    "ddd01", "ddd02", "ddd03", "ddd04", "ddd05"
  ];
  const elements = {};
  elementIds.forEach(id => {
    elements[id] = document.getElementById(id);
  });

  const comboBox = document.getElementById("selectedRegions");
  const selectedValueDisplay = document.getElementById("selectedValueDisplay");
  const selectedValueDisplay2 = document.getElementById("selectedValueDisplay2");

  let ld_cpsgemd_nm = "";
  let ji_bun = "";
  let area = "";
  let value_develop = "";
  let value_conserv = "";
  let value_comp = "";
  let slope = ""; let record_slope = "";
  let height = ""; let record_height = "";
  let dist_gi_str = ""; let record_dist_gi_str = "";
  let dist_gong_ntwk = ""; let record_dist_gong_ntwk = "";
  let rate_city = ""; let record_rate_city = "";
  let rate_city_touch = ""; let record_rate_city_touch = "";
  let dist_road_touch = ""; let record_dist_road = "";
  let rate_kyungji = ""; let record_rate_kyungji = "";
  let rate_saengtae = ""; let record_rate_saengtae = "";
  let rate_gongjuck = ""; let record_rate_gongjuck = "";
  let dist_gongjuck = ""; let record_dist_gongjuck = "";
  let rate_jdgarea = ""; let record_rate_jdgarea = "";
  let rate_nongup = ""; let record_rate_nongup = "";
  let rate_limsangdo = ""; let record_rate_limsangdo = "";
  let rate_bojunmount = ""; let record_rate_bojunmount = "";
  let dist_kyungji = ""; let record_dist_kyungji = "";
  let rate_city_1 = ""; let record_rate_city_1 = "";


  // 콤보박스 값 변경 시 선택된 값을 표시 및 변수에 저장
  let click_F_Jibun = null;
  let click_F_pnu = null; // pnu
  let click_F_ld_cpsgemd_nm = null; // 시도 시군구 읍면리
  let click_F_tpgrph_hg_code_nm = null; // 경사도(ex: 완만함)
  let click_F_lndcgr_code_nm = null; // 지목
  let click_F_lndpcl_ar = null; // 면적
  let click_F_prpos_area_1_nm = null; // 용도지역
  let click_F_land_shape = null; // 토지형태
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
  let click_F_rate_city_1 = null; // 선택영역 도시용지비율
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
  let click_F_record_rate_city_1 = null;
  let click_F_value_develop = null; // 개발적성값 점수
  let click_F_value_conserv = null; // 보전적성값 점수
  let click_F_value_comp = null; // 종합적성값 점수
  let inserted_tpgrph_hg_code_nm = {}; // 입력값
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
  let inserted_record_rate_city_1 = {};
  let inserted_value_develop = {};
  let inserted_value_conserv = {};
  let inserted_value_comp = {};


  // 지도로 결과보기 버튼 클릭 시 SelectionsVector 레이어를 보이도록 설정
  document.getElementById("showOnMap").addEventListener("click", function () {
    SelectionsVector.setVisible(true);
    selectedFeatures.clear();

  });
  selectedFeatures.on(["add", "remove"], function () {
    const names = selectedFeatures.getArray().map(function (feature) {
      const jibun = feature.get("jibun") || "필지 선택";
      const pnu = feature.get("pnu") || ""; // pnu
      ld_cpsgemd_nm = feature.get("ld_cpsgemd_nm") || ""; // 시도 시군구 읍면리
      ji_bun = feature.get("ji_bun") || ""; // 지번
      area = feature.get("lndpcl_ar") || ""; // 면적
      const lndcgr_code_nm = feature.get("lndcgr_code_nm") || "";
      const lndpcl_ar = feature.get("lndpcl_ar") || "";
      const prpos_area_1_nm = feature.get("prpos_area_1_nm") || "";
      const tpgrph_hg_code_nm = feature.get("tpgrph_hg_code_nm") || "";
      const land_shape = feature.get("land_shape") || "";
      const road_side_code_nm = feature.get("road_side_code_nm") || "";
      slope = feature.get("slope") || "";
      height = feature.get("height") || "";
      dist_gi_str = feature.get("dist_gi_str") || "";
      dist_gong_ntwk = feature.get("dist_gong_ntwk") || "";
      rate_city = feature.get("rate_city") || "";
      rate_city_touch = feature.get("rate_city_touch") || "";
      dist_road_touch = feature.get("dist_road_touch") || "";
      rate_kyungji = feature.get("rate_kyungji") || "";
      rate_saengtae = feature.get("rate_saengtae") || "";
      rate_gongjuck = feature.get("rate_gongjuck") || "";
      dist_gongjuck = feature.get("dist_gongjuck") || "";
      rate_jdgarea = feature.get("rate_jdgarea") || "";
      rate_nongup = feature.get("rate_nongup") || "";
      rate_limsangdo = feature.get("rate_limsangdo") || "";
      rate_bojunmount = feature.get("rate_bojunmount") || "";
      dist_kyungji = feature.get("dist_kyungji") || "";
      rate_city_1 = feature.get("rate_city_1") || "";
      record_slope = feature.get("record_slope") || "";
      record_height = feature.get("record_height") || "";
      record_dist_gi_str = feature.get("record_dist_gi_str") || "";
      record_dist_gong_ntwk = feature.get("record_dist_gong_ntwk") || "";
      record_rate_city = feature.get("record_rate_city") || "";
      record_rate_city_touch = feature.get("record_rate_city_touch") || "";
      record_dist_road = feature.get("record_dist_road") || "";
      record_rate_kyungji = feature.get("record_rate_kyungji") || "";
      record_rate_saengtae = feature.get("record_rate_saengtae") || "";
      record_rate_gongjuck = feature.get("record_rate_gongjuck") || "";
      record_dist_gongjuck = feature.get("record_dist_gongjuck") || "";
      record_rate_jdgarea = feature.get("record_rate_jdgarea") || "";
      record_rate_nongup = feature.get("record_rate_nongup") || "";
      record_rate_limsangdo = feature.get("record_rate_limsangdo") || "";
      record_rate_bojunmount = feature.get("record_rate_bojunmount") || "";
      record_dist_kyungji = feature.get("record_dist_kyungji") || "";
      value_develop = feature.get("value_develop") || "";
      value_conserv = feature.get("value_conserv") || "";
      value_comp = feature.get("value_comp") || "";
      record_rate_city_1 = feature.get("record_rate_city_1") || "";
      return { jibun, pnu, ld_cpsgemd_nm, lndcgr_code_nm, lndpcl_ar, prpos_area_1_nm, tpgrph_hg_code_nm, land_shape, road_side_code_nm, slope, height, dist_gi_str, dist_gong_ntwk, rate_city, rate_city_touch, dist_road_touch, rate_kyungji, rate_saengtae, rate_gongjuck, dist_gongjuck, rate_jdgarea, rate_nongup, rate_limsangdo, rate_bojunmount, dist_kyungji, record_slope, record_height, record_dist_gi_str, record_dist_gong_ntwk, record_rate_city, record_rate_city_touch, record_dist_road, record_rate_kyungji, record_rate_saengtae, record_rate_gongjuck, record_dist_gongjuck, record_rate_jdgarea, record_rate_nongup, record_rate_limsangdo, record_rate_bojunmount, record_dist_kyungji, value_develop, value_conserv, value_comp, rate_city_1, record_rate_city_1 };
    });
    updateComboBox(names);
  });

  // rate_city1 속성의 총 합을 계산하는 함수
  // 선택 영역에 대한 도시용지의 개수를 계산
  function calculateRateCity_1Sum(features) {
    let total = 0;
    features.forEach(function (feature) {
      const rate_city_1 = feature.get('rate_city_1');
      if (rate_city_1) {
        total += parseFloat(rate_city_1);
      }
    });
    return total;
  }
  // 콤보박스 업데이트 함수
  function updateComboBox(features) {
    comboBox.innerHTML = "";
    features.forEach(function (feature) {
      if (feature.jibun) {
        const option = document.createElement("option");
        option.value = feature.jibun;
        option.text = feature.jibun;
        option.setAttribute("pnu", feature.pnu); // pnu 데이터 속성으로 추가
        option.setAttribute("ld_cpsgemd_nm", feature.ld_cpsgemd_nm); // 시도 시군구 읍면리 데이터 속성으로 추가
        option.setAttribute("lndcgr_code_nm", feature.lndcgr_code_nm); // lndcgr_code_nm 데이터 속성으로 추가
        option.setAttribute("lndpcl_ar", feature.lndpcl_ar); // lndpcl_ar 데이터 속성으로 추가
        option.setAttribute("prpos_area_1_nm", feature.prpos_area_1_nm); // prpos_area_1_nm 데이터 속성으로 추가
        option.setAttribute("tpgrph_hg_code_nm", feature.tpgrph_hg_code_nm); // tpgrph_hg_code_nm 데이터 속성으로 추가
        option.setAttribute("land_shape", feature.land_shape); // land_shape 데이터 속성으로 추가
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
        option.setAttribute("rate_city_1", feature.rate_city_1);
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
        option.setAttribute("record_rate_city_1", feature.record_rate_city_1);
        option.setAttribute("value_develop", feature.value_develop);
        option.setAttribute("value_conserv", feature.value_conserv);
        option.setAttribute("value_comp", feature.value_comp);
        comboBox.appendChild(option);
      }
    });
  }
  // 콤보박스 변경 시 선택된 지번에 대한 정보 표시
  comboBox.addEventListener("change", function () {
    selectedValueDisplay.textContent = comboBox.value;
    selectedValueDisplay2.textContent = comboBox.value.substring(4);
    click_F_Jibun = comboBox.value;
    const selectedOption = comboBox.options[comboBox.selectedIndex];
    click_F_pnu = selectedOption.getAttribute("pnu"); // pnu
    click_F_ld_cpsgemd_nm = selectedOption.getAttribute("ld_cpsgemd_nm"); // 시도 시군구 읍면리 필요한지 체크
    click_F_tpgrph_hg_code_nm = selectedOption.getAttribute("tpgrph_hg_code_nm"); // 경사도
    click_F_lndcgr_code_nm = selectedOption.getAttribute("lndcgr_code_nm"); // 지목
    click_F_lndpcl_ar = selectedOption.getAttribute("lndpcl_ar"); // 면적
    click_F_prpos_area_1_nm = selectedOption.getAttribute("prpos_area_1_nm"); // 용도지역
    click_F_land_shape = selectedOption.getAttribute("land_shape"); // 토지형태
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
    click_F_rate_city_1 = selectedOption.getAttribute("rate_city_1");
    ////////// 점수 데이터 //////////
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
    click_F_record_rate_city_1 = selectedOption.getAttribute("record_rate_city_1");
    click_F_value_develop = selectedOption.getAttribute("value_develop");
    click_F_value_conserv = selectedOption.getAttribute("value_conserv");
    click_F_value_comp = selectedOption.getAttribute("value_comp");
    document.getElementById("fetchData_link").href =
      "./jsp/fetchData.jsp?selected_pnu='" + click_F_pnu + "'";

    // 필드 값 비우기 --> 콤보박스에서 지번 변경시 초기화되는 부분
    const elementIds = [
      "aaa01", "aaa02", "aaa03", "aaa04",
      "bbb01", "bbb04", "bbb02", "bbb03",
      "ccc01", "ccc02", "ccc03", "ccc04",
      "ddd01", "ddd02", "ddd03", "ddd04", "ddd05",
      "aaaa01", "aaaa02", "aaaa03", "aaaa04",
      "bbbb01", "bbbb02", "bbbb03", "bbbb04",
      "cccc01", "cccc02", "cccc03", "cccc04",
      "dddd01", "dddd02", "dddd03", "dddd04", "dddd05",
      "input2", "input3", "input4"
    ];
    // 각 요소의 값을 빈 문자열로 설정
    elementIds.forEach(id => {
      document.getElementById(id).value = "";
    });
    // selectLayer 업데이트 및 표시
    makeWFSSource2(click_F_Jibun);
  });

  // 조회 버튼 클릭시 db에 저장된 지표값 표시
  function fetchDataAndDisplay() {
    // document.getElementById("searchData").onclick = () => {
    if (inserted_record_slope[click_F_pnu] === undefined) { // 수정값이 없는 경우 - 즉, 처음 조회하는 경우
      console.log("inserted_tpgrph_hg_code_nm is null for current pnu");
      elements.aaa01.innerText = click_F_slope; // span, div, p -> innerText 사용
      elements.aaa02.innerText = click_F_height;
      elements.aaa03.innerText = click_F_dist_gi_str;
      elements.aaa04.innerText = click_F_dist_gong_ntwk;
      elements.bbb01.innerText = Math.round(click_F_rate_city);
      const selectSum = selectedFeatures.getLength() - 1
      elements.bbb04.innerText = Math.round(((calculateRateCity_1Sum(selectedFeatures)) / (selectSum)) * 100);
      elements.bbb02.innerText = Math.round(click_F_rate_city_touch);
      elements.bbb03.innerText = Math.round(click_F_dist_road_touch);
      elements.ccc01.innerText = click_F_rate_kyungji;
      elements.ccc02.innerText = click_F_rate_saengtae;
      elements.ccc03.innerText = click_F_rate_gongjuck;
      elements.ccc04.innerText = click_F_dist_gongjuck;
      elements.ddd01.innerText = click_F_rate_jdgarea;
      elements.ddd02.innerText = click_F_rate_nongup;
      elements.ddd03.innerText = click_F_rate_limsangdo;
      elements.ddd04.innerText = click_F_rate_bojunmount;
      elements.ddd05.innerText = click_F_dist_kyungji;
      // input, textarea, select -> .value 사용
      document.getElementById("aaaa01").value = click_F_record_slope;
      document.getElementById("aaaa02").value = click_F_record_height;
      document.getElementById("aaaa03").value = click_F_record_dist_gi_str;
      document.getElementById("aaaa04").value = click_F_record_dist_gong_ntwk;
      document.getElementById("bbbb01").value = click_F_record_rate_city;
      document.getElementById("bbbb04").value = click_F_record_rate_city_1;
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

    } else { // insertData로 입력,수정한 값이 있는 경우
      aaa01.innerText = click_F_slope;
      aaa02.innerText = click_F_height;
      aaa03.innerText = click_F_dist_gi_str;
      aaa04.innerText = click_F_dist_gong_ntwk;
      bbb01.innerText = click_F_rate_city;
      bbb04.innerText = click_F_rate_city_1;
      bbb02.innerText = click_F_rate_city_touch;
      bbb03.innerText = click_F_dist_road_touch;
      ccc01.innerText = click_F_rate_kyungji;
      ccc03.innerText = click_F_rate_gongjuck;
      ccc04.innerText = click_F_dist_gongjuck;
      ddd01.innerText = click_F_rate_jdgarea;
      ddd02.innerText = click_F_rate_nongup;
      ddd03.innerText = click_F_rate_limsangdo;
      ddd04.innerText = click_F_rate_bojunmount;
      ddd05.innerText = click_F_dist_kyungji;

      document.getElementById("aaaa01").value = inserted_record_slope[click_F_pnu];
      document.getElementById("aaaa02").value = inserted_record_height[click_F_pnu];
      document.getElementById("aaaa03").value = inserted_record_dist_gi_str[click_F_pnu];
      document.getElementById("aaaa04").value = inserted_record_dist_gong_ntwk[click_F_pnu];
      document.getElementById("bbbb01").value = inserted_record_rate_city[click_F_pnu];
      document.getElementById("bbbb04").value = inserted_record_rate_city_1[click_F_pnu];
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

    // 기본 정보 팝업
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
        "토지형태: " + click_F_land_shape;
      document.getElementById("info05").innerHTML =
        "도로인접면: " + click_F_road_side_code_nm;
      if (centers2[emdid]) {
        const selectedCenter = centers2[emdid];
        overlay.setPosition(selectedCenter);
      }
    }
    overlay2.setPosition(undefined);
  };

  // 조회 버튼 클릭 이벤트
  document.getElementById("searchData").onclick = fetchDataAndDisplay;

  // 입력 버튼 클릭시 이벤트... 작성한 지표값 jsp로 전송
  document.getElementById("insertData").onclick = () => {
    // 개발적성 선택지표와 보전적성 선택지표 각각의 선택 개수 세기
    const selectedDevIndicators = document.querySelectorAll(".dev-checkbox:checked").length;
    const selectedConIndicators = document.querySelectorAll(".con-checkbox:checked").length;

    if (selectedDevIndicators < 2 || selectedConIndicators < 2) {
      // 개발적성 또는 보전적성 선택지표가 2개 미만인 경우 경고창 표시
      alert("개발적성 및 보전적성의 선택지표를 각각 두 개 선택해야 합니다.");
      return;
    }

    const elementIds = [
      "aaaa01", "aaaa02", "aaaa03", "aaaa04",
      "bbbb01", "bbbb04", "bbbb02", "bbbb03",
      "cccc01", "cccc02", "cccc03", "cccc04",
      "dddd01", "dddd02", "dddd03", "dddd04", "dddd05",
      "input2", "input3", "input4"
    ];

    // 각 요소의 값을 객체에 저장
    const values = {};
    elementIds.forEach(id => {
      values[id] = document.getElementById(id).value;
    });

    inserted_record_slope[click_F_pnu] = values.aaaa01;
    inserted_record_height[click_F_pnu] = values.aaaa02;
    inserted_record_dist_gi_str[click_F_pnu] = values.aaaa03;
    inserted_record_dist_gong_ntwk[click_F_pnu] = values.aaaa04;
    inserted_record_rate_city[click_F_pnu] = values.bbbb01;
    inserted_record_rate_city_1[click_F_pnu] = values.bbbb04;
    inserted_record_rate_city_touch[click_F_pnu] = values.bbbb02;
    inserted_record_dist_road[click_F_pnu] = values.bbbb03;
    inserted_record_rate_kyungji[click_F_pnu] = values.cccc01;
    inserted_record_rate_saengtae[click_F_pnu] = values.cccc02;
    inserted_record_rate_gongjuck[click_F_pnu] = values.cccc03;
    inserted_record_dist_gongjuck[click_F_pnu] = values.cccc04;
    inserted_record_rate_jdgarea[click_F_pnu] = values.dddd01;
    inserted_record_rate_nongup[click_F_pnu] = values.dddd02;
    inserted_record_rate_limsangdo[click_F_pnu] = values.dddd03;
    inserted_record_rate_bojunmount[click_F_pnu] = values.dddd04;
    inserted_record_dist_kyungji[click_F_pnu] = values.dddd05;
    inserted_value_develop[click_F_pnu] = values.input2;
    inserted_value_conserv[click_F_pnu] = values.input3;
    inserted_value_comp[click_F_pnu] = values.input4;

    // 선택된 지번과 레이어 정보 저장
    localStorage.setItem("click_F_pnu", click_F_pnu);
    localStorage.setItem("inserted_tpgrph_hg_code_nm", JSON.stringify(inserted_tpgrph_hg_code_nm));
    localStorage.setItem("inserted_record_slope", JSON.stringify(inserted_record_slope));
    localStorage.setItem("inserted_record_height", JSON.stringify(inserted_record_height));
    localStorage.setItem("inserted_record_dist_gi_str", JSON.stringify(inserted_record_dist_gi_str));
    localStorage.setItem("inserted_record_dist_gong_ntwk", JSON.stringify(inserted_record_dist_gong_ntwk));
    localStorage.setItem("inserted_record_rate_city", JSON.stringify(inserted_record_rate_city));
    localStorage.setItem("inserted_record_rate_city_1", JSON.stringify(inserted_record_rate_city_1));
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

    sendData(click_F_pnu, values.aaaa01, values.aaaa02, values.aaaa03, values.aaaa04, values.bbbb01, values.bbbb04, values.bbbb02, values.bbbb03, values.cccc01, values.cccc02, values.cccc03, values.cccc04, values.dddd01, values.dddd02, values.dddd03, values.dddd04, values.dddd05, values.input2, values.input3, values.input4);
  };

  // jsp로 데이터 전송
  function sendData(click_F_pnu, inserted_record_slope, inserted_record_height, inserted_record_dist_gi_str, inserted_record_dist_gong_ntwk, inserted_record_rate_city, inserted_record_rate_city_1, inserted_record_rate_city_touch, inserted_record_dist_road, inserted_record_rate_kyungji, inserted_record_rate_saengtae, inserted_record_rate_gongjuck, inserted_record_dist_gongjuck, inserted_record_rate_jdgarea, inserted_record_rate_nongup, inserted_record_rate_limsangdo, inserted_record_rate_bojunmount, inserted_record_dist_kyungji, inserted_value_develop, inserted_value_conserv, inserted_value_comp) {

    var url =
      `./jsp/fetchData.jsp?selected_pnu=${encodeURIComponent(click_F_pnu)}&inserted_record_slope=${encodeURIComponent(inserted_record_slope)}&inserted_record_height=${encodeURIComponent(inserted_record_height)}&inserted_record_dist_gi_str=${encodeURIComponent(inserted_record_dist_gi_str)}&inserted_record_dist_gong_ntwk=${encodeURIComponent(inserted_record_dist_gong_ntwk)}&inserted_record_rate_city=${encodeURIComponent(inserted_record_rate_city)}&inserted_record_rate_city_1=${encodeURIComponent(inserted_record_rate_city_1)}&inserted_record_rate_city_touch=${encodeURIComponent(inserted_record_rate_city_touch)}&inserted_record_dist_road=${encodeURIComponent(inserted_record_dist_road)}&inserted_record_rate_kyungji=${encodeURIComponent(inserted_record_rate_kyungji)}&inserted_record_rate_saengtae=${encodeURIComponent(inserted_record_rate_saengtae)}&inserted_record_rate_gongjuck=${encodeURIComponent(inserted_record_rate_gongjuck)}&inserted_record_dist_gongjuck=${encodeURIComponent(inserted_record_dist_gongjuck)}&inserted_record_rate_jdgarea=${encodeURIComponent(inserted_record_rate_jdgarea)}&inserted_record_rate_nongup=${encodeURIComponent(inserted_record_rate_nongup)}&inserted_record_rate_limsangdo=${encodeURIComponent(inserted_record_rate_limsangdo)}&inserted_record_rate_bojunmount=${encodeURIComponent(inserted_record_rate_bojunmount)}&inserted_record_dist_kyungji=${encodeURIComponent(inserted_record_dist_kyungji)}&inserted_value_develop=${encodeURIComponent(inserted_value_develop)}&inserted_value_conserv=${encodeURIComponent(inserted_value_conserv)}&inserted_value_comp=${encodeURIComponent(inserted_value_comp)}`;
    fetch(url, {
      method: "POST", // 서버와의 데이터 전송 방식을 지정 (GET 또는 POST)
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Response from server:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // 읍면동 선택 돌아가기 버튼 클릭 이벤트
  document.getElementById("backButton").onclick = () => {
    // 슬라이드 애니메이션을 위해 기존 클래스 제거
    document.getElementById("menu1").classList.remove("slide-out", "slide-in");
    document.getElementById("menu2").classList.remove("menu2-slide-in", "menu2-slide-out");
    document.getElementById("mapArea").classList.remove("map-expand", "map-contract");

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

    // 선택된 항목 해제
    selectedEmdids.forEach(emdid => {
      document.getElementById(emdid).parentElement.classList.remove("selected-emd");
    });
    selectedEmdids = [];
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
  ["bbbb01", "bbbb04", "bbbb02", "bbbb03"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateDevVal);
  });
  ["cccc01", "cccc02", "cccc03", "cccc04"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateConVal);
  });
  ["dddd01", "dddd02", "dddd03", "dddd04", "dddd05"].forEach((id) => {
    document.getElementById(id).addEventListener("input", calculateConVal);
  });

  // 체크박스 변경 이벤트 리스너
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
      localStorage.setItem("click_F_pnu", click_F_pnu);
      deleteData(click_F_pnu);
    }
  });

  // 삭제 요청 함수
  function deleteData(click_F_pnu) {
    // console.log("점수 삭제 완료");
    var url =
      `./jsp/deleteData.jsp?selected_pnu=${encodeURIComponent(click_F_pnu)}`;
    fetch(url, {
      method: "POST",
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Response from server:", data);
        const zero = 0;
        const elementIds = [
          "aaaa01", "aaaa02", "aaaa03", "aaaa04",
          "bbbb01", "bbbb02", "bbbb03", "bbbb04",
          "cccc01", "cccc02", "cccc03", "cccc04",
          "dddd01", "dddd02", "dddd03", "dddd04", "dddd05"
        ];
        elementIds.forEach(id => {
          document.getElementById(id).value = zero; // 삭제 즉시 화면에 0으로 보여줌
        });
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

  // 선택지표에 대한 체크박스 선택 제한.. 2개
  limitCheckboxSelection('dev-checkbox', 2);
  limitCheckboxSelection('con-checkbox', 2);
  limitCheckboxSelection('dev-checkbox2', 2);
  limitCheckboxSelection('con-checkbox2', 2);

  // HWPX 파일 생성 함수
  function createHWPXContent(data, template) {
    return template
      .replace("{{jibun}}", data.jibun)
      .replace("{{ld_cpsgemd_nm}}", data.ld_cpsgemd_nm)
      .replace("{{value_develop}}", data.value_develop)
      .replace("{{value_conserv}}", data.value_conserv)
      .replace("{{value_comp}}", data.value_comp)
      .replace("{{ji_bun}}", data.ji_bun)
      .replace("{{area}}", data.area)
      .replace("{{slope}}", data.slope)
      .replace("{{height}}", data.height)
      .replace("{{dist_gi_str}}", data.dist_gi_str)
      .replace("{{dist_gong_ntwk}}", data.dist_gong_ntwk)
      .replace("{{rate_city}}", data.rate_city)
      .replace("{{rate_city_touch}}", data.rate_city_touch)
      .replace("{{dist_road_touch}}", data.dist_road_touch)
      .replace("{{rate_kyungji}}", data.rate_kyungji)
      .replace("{{rate_saengtae}}", data.rate_saengtae)
      .replace("{{rate_gongjuck}}", data.rate_gongjuck)
      .replace("{{dist_gongjuck}}", data.dist_gongjuck)
      .replace("{{rate_jdgarea}}", data.rate_jdgarea)
      .replace("{{rate_nongup}}", data.rate_nongup)
      .replace("{{rate_limsangdo}}", data.rate_limsangdo)
      .replace("{{rate_bojunmount}}", data.rate_bojunmount)
      .replace("{{dist_kyungji}}", data.dist_kyungji)
      .replace("{{rate_city_1}}", data.rate_city_1)
      .replace("{{record_slope}}", data.record_slope)
      .replace("{{record_height}}", data.record_height)
      .replace("{{record_dist_gi_str}}", data.record_dist_gi_str)
      .replace("{{record_dist_gong_ntwk}}", data.record_dist_gong_ntwk)
      .replace("{{record_rate_city}}", data.record_rate_city)
      .replace("{{record_rate_city_touch}}", data.record_rate_city_touch)
      .replace("{{record_dist_road}}", data.record_dist_road)
      .replace("{{record_rate_kyungji}}", data.record_rate_kyungji)
      .replace("{{record_rate_saengtae}}", data.record_rate_saengtae)
      .replace("{{record_rate_gongjuck}}", data.record_rate_gongjuck)
      .replace("{{record_dist_gongjuck}}", data.record_dist_gongjuck)
      .replace("{{record_rate_jdgarea}}", data.record_rate_jdgarea)
      .replace("{{record_rate_nongup}}", data.record_rate_nongup)
      .replace("{{record_rate_limsangdo}}", data.record_rate_limsangdo)
      .replace("{{record_rate_bojunmount}}", data.record_rate_bojunmount)
      .replace("{{record_dist_kyungji}}", data.record_dist_kyungji)
      .replace("{{record_rate_city_1}}", data.record_rate_city_1)
      ;
  }

  // 한글파일에 입력할 데이터를 수집하는 함수
  function collectData() {
    const data = {
      jibun: document.getElementById('selectedValueDisplay2').textContent,
      ld_cpsgemd_nm: click_F_ld_cpsgemd_nm,
      value_develop: click_F_value_develop,
      value_conserv: click_F_value_conserv,
      value_comp: click_F_value_comp,
      area: click_F_lndpcl_ar,
      ji_bun: document.getElementById('selectedValueDisplay2').textContent.substring(4),
      slope: click_F_slope,
      height: click_F_height,
      dist_gi_str: click_F_dist_gi_str,
      dist_gong_ntwk: click_F_dist_gong_ntwk,
      rate_city: click_F_rate_city,
      rate_city_touch: click_F_rate_city_touch,
      dist_road_touch: click_F_dist_road_touch,
      rate_kyungji: click_F_rate_kyungji,
      rate_saengtae: click_F_rate_saengtae,
      rate_gongjuck: click_F_rate_gongjuck,
      dist_gongjuck: click_F_dist_gongjuck,
      rate_jdgarea: click_F_rate_jdgarea,
      rate_nongup: click_F_rate_nongup,
      rate_limsangdo: click_F_rate_limsangdo,
      rate_bojunmount: click_F_rate_bojunmount,
      dist_kyungji: click_F_dist_kyungji,
      rate_city_1: click_F_rate_city_1,
      record_slope: click_F_record_slope,
      record_height: click_F_record_height,
      record_dist_gi_str: click_F_record_dist_gi_str,
      record_dist_gong_ntwk: click_F_record_dist_gong_ntwk,
      record_rate_city: click_F_record_rate_city,
      record_rate_city_touch: click_F_record_rate_city_touch,
      record_dist_road: click_F_record_dist_road,
      record_rate_kyungji: click_F_record_rate_kyungji,
      record_rate_saengtae: click_F_record_rate_saengtae,
      record_rate_gongjuck: click_F_record_rate_gongjuck,
      record_dist_gongjuck: click_F_record_dist_gongjuck,
      record_rate_jdgarea: click_F_record_rate_jdgarea,
      record_rate_nongup: click_F_record_rate_nongup,
      record_rate_limsangdo: click_F_record_rate_limsangdo,
      record_rate_bojunmount: click_F_record_rate_bojunmount,
      record_dist_kyungji: click_F_record_dist_kyungji,
      record_rate_city_1: click_F_record_rate_city_1,
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

  // HWPX 파일 생성 버튼 클릭 이벤트
  document.getElementById('generateHWPX').addEventListener('click', () => {
    fetch('template.htm') // 준비된 템플릿으로 데이터 전송
      .then(response => response.text())
      .then(template => {
        const data = collectData();
        const hwpxContent = createHWPXContent(data, template);
        downloadHWPX(hwpxContent, '토지적성평가.hwpx');
      });
  });

  // 읍면동 선택 후 확인 버튼 클릭 이벤트
  document.getElementById("confirmSelection").addEventListener("click", function () {
    if (selectedEmdids.length > 0) {
      // selectedEmdids가 배열인지 확인하고 변환
      const filter = makeFilter1(Array.from(selectedEmdids));
      makeWFSSource(Array.from(selectedEmdids));

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
    } else {
      alert("먼저 읍면동을 선택하세요.");
    }
  });

  // 읍면동 선택 이벤트
  let selectedEmdids = [];
  for (let i = 0; i <= 9; i++) {
    const id = i < 10 ? "0" + i : i.toString();
    const liElement = document.getElementById(`emd${id}-item`);
    liElement.onclick = () => {
      emdid = `emd${id}`;
      const currentElement = document.getElementById(emdid).parentElement;

      // 이미 선택된 항목인 경우 선택 해제
      if (selectedEmdids.includes(emdid)) {
        currentElement.classList.remove("selected-emd");
        selectedEmdids = selectedEmdids.filter(e => e !== emdid);
        console.log("선택 해제됨: " + emdid);
      } else {
        // 새로 선택된 항목에 클래스 추가
        currentElement.classList.add("selected-emd");
        selectedEmdids.push(emdid);
        console.log("선택됨: " + emdid);
      }
    };
  }

  // 폴리곤 팝업 내 체크박스 선택 제한 함수
  function validateDevCheckboxes2() {
    const devCheckboxes2 = document.querySelectorAll('.dev-checkbox2');
    const checkedCount = Array.from(devCheckboxes2).filter(checkbox => checkbox.checked).length;
    return checkedCount === 2;
  }
  function validateConCheckboxes2() {
    const conCheckboxes2 = document.querySelectorAll('.con-checkbox2');
    const checkedCount = Array.from(conCheckboxes2).filter(checkbox => checkbox.checked).length;
    return checkedCount === 2;
  }
  // 체크박스가 있는 값 더하기
  function sumPolyDevdata() {
    let sum = 0;
    for (let i = 1; i <= 7; i++) {
      const checkbox = document.getElementById(`check_polyDevdata0${i}`);
      const input = document.getElementById(`polyDevdata0${i}`);
      if ((checkbox && checkbox.checked || !checkbox) && input && !isNaN(parseFloat(input.value))) {
        sum += parseFloat(input.value);
      }
    }
    document.getElementById('polydata03').value = sum;
  }
  function sumPolyConvdata() {
    let sum = 0;
    for (let i = 1; i <= 9; i++) {
      const checkbox = document.getElementById(`check_polyConvdata0${i}`);
      const input = document.getElementById(`polyConvdata0${i}`);
      if ((checkbox && checkbox.checked || !checkbox) && input && !isNaN(parseFloat(input.value))) {
        sum += parseFloat(input.value);
      }
    }
    document.getElementById('polydata04').value = sum;
  }
  // 종합적성값 계산
  function sumTotal() {
    const polydata03 = parseFloat(document.getElementById('polydata03').value) || 0;
    const polydata04 = parseFloat(document.getElementById('polydata04').value) || 0;
    document.getElementById('polydata05').value = polydata03 - polydata04;
  }

  // 두개씩 선택 안하면 입력 수정 버튼 비활성화 함수
  function validateCheckboxes2() {
    const isValidDev2 = validateDevCheckboxes2();
    const isValidCon2 = validateConCheckboxes2();
    document.getElementById("insertPoly").disabled = !(isValidDev2 && isValidCon2);
    document.getElementById("updatePoly").disabled = !(isValidDev2 && isValidCon2);
    if (isValidDev2) {
      sumPolyDevdata();
    } else {
      document.getElementById('polydata03').value = '';
    }
    if (isValidCon2) {
      sumPolyConvdata();
    } else {
      document.getElementById('polydata04').value = '';
    }
    sumTotal();
  }

  // 초기 로드 시 버튼 비활성화 및 합계 계산
  document.addEventListener('DOMContentLoaded', function () {
    validateCheckboxes2();
  });

  // 체크박스 변경 시 이벤트 리스너 추가 및 합계 계산
  document.querySelectorAll('.dev-checkbox2, .con-checkbox2').forEach(checkbox => {
    checkbox.addEventListener('change', validateCheckboxes2);
  });

  // 데이터 입력 시 합계 다시 계산
  document.querySelectorAll('.dev-checkbox2, .con-checkbox2, .info-input').forEach(element => {
    element.addEventListener('input', () => {
      if (element.classList.contains('dev-checkbox2') || element.id.startsWith('polyDevdata')) {
        sumPolyDevdata();
      }
      if (element.classList.contains('con-checkbox2') || element.id.startsWith('polyConvdata')) {
        sumPolyConvdata();
      }
      sumTotal();
    });
  });
});

// 추가 레이어 파트... wms, wfs 비교 필요
const layerUrls = {
  bu_1km:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:bu_1km&outputFormat=application/json",
  bu_2km:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:bu_2km&outputFormat=application/json",
  bu_3km:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:bu_3km&outputFormat=application/json",
  city_development_region:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:city_development_region&outputFormat=application/json",
  commerce_region:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:commerce_region&outputFormat=application/json",
  dwelling_region:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:dwelling_region&outputFormat=application/json",
  industry_complex:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:industry_complex&outputFormat=application/json",
  industry_region:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:industry_region&outputFormat=application/json",
  residential_area:
    "http://172.20.221.158:42888/geoserver/bootWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bootWS:residential_area&outputFormat=application/json",
};

const mapLayers = {}; // 각 레이어 상태를 저장하기 위한 객체

// 각 레이어에 대한 색상 설정
const layerColors = {
  bu_1km: "rgba(102, 0, 0, 0.747)",
  bu_2km: "rgba(168, 0, 0, 0.575)",
  bu_3km: "rgba(255, 0, 0, 0.459)",
  city_development_region: "rgba(255, 255, 0, 0.3)",
  commerce_region: "rgba(0, 255, 255, 0.3)",
  dwelling_region: "rgba(255, 0, 255, 0.3)",
  industry_complex: "rgba(128, 0, 128, 0.3)",
  industry_region: "rgba(128, 128, 0, 0.3)",
  residential_area: "rgba(0, 128, 128, 0.3)",
};

// 추가 레이어 토글 함수
function toggleLayer(layerName) {
  console.log(`토글 레이어 호출됨: ${layerName}`);
  if (mapLayers[layerName]) {
    map.removeLayer(mapLayers[layerName]);
    delete mapLayers[layerName];
    console.log(`레이어 제거됨: ${layerName}`);
  } else {
    const vectorSource = new VectorSource({
      url: layerUrls[layerName],
      format: new GeoJSON(),
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: layerColors[layerName] || "rgba(255, 0, 0, 0.3)",
        }),
        stroke: new Stroke({
          color: "rgba(100, 100, 100, 1.0)",
          width: 0.3,
        }),
      }),
    });
    map.addLayer(vectorLayer);
    mapLayers[layerName] = vectorLayer;
    console.log(`레이어 추가됨: ${layerName}`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // 트리거 영역과 menu3-container 요소를 선택
  const triggerArea = document.getElementById("trigger-area");
  const menu3Container = document.querySelector(".menu3-container");
  let hideTimeout;
  // 마우스가 트리거 영역에 들어오면 menu3-container를 보이게 함
  triggerArea.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
    menu3Container.style.display = "flex";
    console.log("트리거 영역에 마우스 진입");
  });
  // 마우스가 트리거 영역을 벗어나면 일정 시간 후 menu3-container를 숨김
  triggerArea.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => {
      menu3Container.style.display = "none";
      console.log("트리거 영역에서 마우스 벗어남");
    }, 5000); // 5초 후에 숨김
  });
  // 이벤트 위임을 사용하여 menu3-container에 클릭 이벤트 리스너를 등록
  menu3Container.addEventListener("click", (event) => {
    if (event.target.classList.contains("menu3-label")) {
      const layerName = event.target.getAttribute("data-layer");
      console.log(`버튼 클릭됨: ${layerName}`);
      toggleLayer(layerName);
    }
  });
  const legend = document.getElementById("legend");
  const showResultsBtn = document.getElementById("showOnMap");

  function updateLegendPosition() {
    const legend = document.getElementById("legend");
    legend.style.bottom = '10px'; // maparea의 하단에서 10px 위
    legend.style.left = '10px';   // maparea의 좌측에서 10px 오른쪽
  }
  // 지도로 결과보기 버튼 클릭 시 범례 표시
  showResultsBtn.addEventListener("click", function () {
    legend.style.display = 'flex';
    updateLegendPosition();
  });

  // 폴리곤 클릭 이벤트 리스너 추가
  map.on('click', function (evt) {
    // 클릭된 폴리곤이 있는지 확인
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      if (feature.getGeometry().getType() === 'Polygon') {
        legend.style.display = 'flex';
        updateLegendPosition();
      }
    });
  });
  // 읍면동 선택 버튼 클릭 시 범례 숨기기
  backButton.addEventListener("click", function () {
    legend.style.display = 'none';
  });
  // 창 크기 변경 시 위치 업데이트
  window.addEventListener("resize", updateLegendPosition);
});

// 도움말 버튼 클릭 이벤트
document.getElementById('help-btn').onclick = function (event) {
  var helpPopup = document.getElementById('help-popup');
  // 팝업의 디스플레이를 설정해 실제 너비를 계산
  helpPopup.style.display = 'block';
  var rect = event.target.getBoundingClientRect();
  helpPopup.style.top = rect.bottom + 'px';
  helpPopup.style.left = (rect.right - helpPopup.offsetWidth) + 'px';
};
// 도움말 팝업 닫기 이벤트
document.getElementById('close-help-popup').onclick = function () {
  document.getElementById('help-popup').style.display = 'none';
};


