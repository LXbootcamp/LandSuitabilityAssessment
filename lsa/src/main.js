import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style, Circle } from "ol/style.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Map from "ol/Map.js";
import Tile from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from "ol/View.js";
import { Select, Draw } from "ol/interaction.js";
import Feature from "ol/Feature.js";
import Overlay from "ol/Overlay.js";
import { toLonLat } from "ol/proj.js";
import { toStringHDMS } from "ol/coordinate.js";
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js";

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  // 로그인 상태 확인
  fetch("http://172.20.221.159:3000/checkLogin", {
    method: "GET",
    credentials: "include", // 세션 쿠키를 포함하여 요청
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Failed to fetch login status:", response.statusText);
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Login status:", data);
      if (!data.loggedIn) {
        // 로그인되어 있지 않으면 login.html로 리디렉션
        console.log("User not logged in, redirecting to login.html");
        if (window.location.pathname !== "/login.html") {
          window.location.href = "login.html";
        }
      } else {
        console.log("User is logged in");
      }
    })
    .catch((error) => {
      console.error("Error fetching login status:", error);
      if (window.location.pathname !== "/login.html") {
        window.location.href = "login.html";
      }
    });

  // HTML 요소가 DOM에 존재하는지 확인한 후 이벤트 리스너를 추가합니다.
  const comboBox = document.getElementById("selectedRegions");
  const selectedValueDisplay = document.getElementById("selectedValueDisplay");

  // 요소가 존재할 경우에만 이벤트 리스너 추가
  if (comboBox && selectedValueDisplay) {
    comboBox.addEventListener("change", function () {
      selectedValueDisplay.textContent = comboBox.value;
      clickedFeatureJibun = comboBox.value;
    });
  }

  const backButton = document.getElementById("backButton");
  if (backButton) {
    // 요소가 존재할 경우에만 이벤트 리스너 추가
    backButton.onclick = () => {
      document
        .getElementById("menu1")
        .classList.remove("slide-out", "slide-in");
      document
        .getElementById("menu2")
        .classList.remove("menu2-slide-in", "menu2-slide-out");
      document
        .getElementById("mapArea")
        .classList.remove("map-expand", "map-contract");

      document.getElementById("menu1").classList.add("slide-in");
      document.getElementById("menu2").classList.add("menu2-slide-out");
      document.getElementById("mapArea").classList.add("map-contract");

      document.getElementById("menu2").classList.add("hidden");

      const view = map.getView();
      view.animate({
        center: initialCenter,
        zoom: initialZoom,
        duration: 1000,
      });

      selectedFeatures.clear();
      SelectionsSource.clear();
      vectorLayer.setVisible(false);
      SelectionsVector.setVisible(false);
      DrawVector.setVisible(false);
    };
  }

  for (let i = 1; i <= 9; i++) {
    const id = i < 10 ? "0" + i : i.toString();
    const emdElement = document.getElementById("emd" + id);
    if (emdElement) {
      // 요소가 존재할 경우에만 이벤트 리스너 추가
      emdElement.onclick = () => {
        console.log("emd" + id + " clicked");
        makeWFSSource("emd" + id);

        document
          .getElementById("menu1")
          .classList.remove("slide-in", "slide-out");
        document
          .getElementById("menu2")
          .classList.remove("menu2-slide-out", "menu2-slide-in");
        document
          .getElementById("mapArea")
          .classList.remove("map-contract", "map-expand");

        document.getElementById("menu1").classList.add("slide-out");
        document.getElementById("menu2").classList.add("menu2-slide-in");
        document.getElementById("mapArea").classList.add("map-expand");

        document.getElementById("menu2").classList.remove("hidden");
      };
    }
  }
});

// 기존 main.js 코드 ...
var vectorLayer;
var vectorSource;

const centers = {
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

// 초기 지도 중심과 확대 수준
const initialCenter = [14071801, 4158523];
const initialZoom = 11;

function makeFilter1(method) {
  let filter1 = "";

  if ("emd01" == method) filter1 = "ld_cpsgemd_nm like '%망운면%'";
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
  url: "http://localhost:42888/geoserver/campWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=campWS:muan_emd&outputFormat=application/json",
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

function makeWFSSource(method) {
  vectorSource = new VectorSource({
    url: encodeURI(
      "http://localhost:42888/geoserver/campWS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=campWS:muan_all_3857&outputFormat=application/json&CQL_FILTER=" +
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
  view.animate({
    center: centers[method],
    zoom: 12.5,
    duration: 1000, // 1초 동안 애니메이션
  });
}
//makeWFSSource("");

vectorLayer = new VectorLayer({
  // source: vectorSource,
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

const popup = document.getElementById("popup");

const overlay = new Overlay({
  element: popup,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const map = new Map({
  layers: [raster, vectorLayer2, vectorLayer, SelectionsVector, DrawVector],
  target: "map",
  overlays: [overlay],
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

const comboBox = document.getElementById("selectedRegions");
const selectedValueDisplay = document.getElementById("selectedValueDisplay");

// 콤보박스 값 변경 시 선택된 값을 표시 및 변수에 저장
let clickedFeatureJibun = null;
let clickedFeature_pnu = null;
let clickedFeature_tpgrph_hg_code_nm = null;
let clickedFeature_ld_cpsgemd_nm = null;
let clickedFeature_regstr_se_code = null;
let clickedFeature_regstr_se_nm = null;

if (comboBox) {
  // 콤보박스가 존재할 경우에만 이벤트 리스너 추가
  comboBox.addEventListener("change", function () {
    selectedValueDisplay.textContent = comboBox.value;
    clickedFeatureJibun = comboBox.value;
  });
}

selectedFeatures.on(["add", "remove"], function () {
  const names = selectedFeatures.getArray().map(function (feature) {
    const jibun = feature.get("jibun") || "필지 선택";
    const pnu = feature.get("pnu") || ""; // pnu 값을 가져옴
    const tpgrph_hg_code = feature.get("tpgrph_hg_code") || "";
    const ld_cpsgemd_nm = feature.get("ld_cpsgemd_nm") || "";
    const regstr_se_code = feature.get("regstr_se_code") || "";
    const regstr_se_nm = feature.get("regstr_se_nm") || "";
    return {
      jibun,
      pnu,
      tpgrph_hg_code,
      ld_cpsgemd_nm,
      regstr_se_code,
      regstr_se_nm,
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
      option.setAttribute("pnu", feature.pnu); // pnu 값을 데이터 속성으로 추가
      option.setAttribute("tpgrph_hg_code", feature.tpgrph_hg_code);
      option.setAttribute("ld_cpsgemd_nm", feature.ld_cpsgemd_nm);
      option.setAttribute("regstr_se_code", feature.regstr_se_code);
      option.setAttribute("regstr_se_nm", feature.regstr_se_nm);

      comboBox.appendChild(option);
    }
  });
}

// 콤보박스 값 변경 시 선택된 값을 표시
if (comboBox) {
  // 콤보박스가 존재할 경우에만 이벤트 리스너 추가
  comboBox.addEventListener("change", function () {
    // 일단 창을 닫음. 이렇게 하면 자료가 없는 곳을 찍으면 창이 닫히는 효과가 나옴
    overlay.setPosition(undefined);

    selectedValueDisplay.textContent = comboBox.value;
    clickedFeatureJibun = comboBox.value;
    const selectedOption = comboBox.options[comboBox.selectedIndex];
    clickedFeature_pnu = selectedOption.getAttribute("pnu");
    clickedFeature_tpgrph_hg_code_nm =
      selectedOption.getAttribute("tpgrph_hg_code");
    clickedFeature_ld_cpsgemd_nm = selectedOption.getAttribute("ld_cpsgemd_nm");
    clickedFeature_regstr_se_code =
      selectedOption.getAttribute("regstr_se_code");
    clickedFeature_regstr_se_nm = selectedOption.getAttribute("regstr_se_nm");
    console.log("Selected Jibun:", clickedFeatureJibun);
    console.log("Selected pnu:", clickedFeature_pnu);
    console.log(
      "Selected tpgrph_hg_code_nm:",
      clickedFeature_tpgrph_hg_code_nm
    );
    console.log("Selected ld_cpsgemd_nm:", clickedFeature_ld_cpsgemd_nm);
    console.log("Selected regstr_se_code:", clickedFeature_regstr_se_code);
    console.log("Selected regstr_se_nm:", clickedFeature_regstr_se_nm);
    document.getElementById("fetchData_link").href =
      "./fetchData.jsp?selected_pnu='" + clickedFeature_pnu + "'";
    document.getElementById("aaa01").value = clickedFeature_tpgrph_hg_code_nm;
    document.getElementById("aaa02").value = clickedFeature_ld_cpsgemd_nm;
    document.getElementById("aaa03").value = clickedFeature_regstr_se_code;
    document.getElementById("aaa04").value = clickedFeature_regstr_se_nm;
  });
}

const backButton = document.getElementById("backButton");
if (backButton) {
  // 요소가 존재할 경우에만 이벤트 리스너 추가
  backButton.onclick = () => {
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
  };
}

for (let i = 1; i <= 9; i++) {
  const id = i < 10 ? "0" + i : i.toString();
  const emdElement = document.getElementById("emd" + id);
  if (emdElement) {
    // 요소가 존재할 경우에만 이벤트 리스너 추가
    emdElement.onclick = () => {
      console.log("emd" + id + " clicked");
      makeWFSSource("emd" + id);

      // 슬라이드 애니메이션을 위해 기존 클래스 제거
      document
        .getElementById("menu1")
        .classList.remove("slide-in", "slide-out");
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

      document.getElementById("menu2").classList.remove("hidden");
    };
  }
}
