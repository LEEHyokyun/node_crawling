const express = require("express");

// 모듈선언
const request = require("request-promise");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

//json 형태의 데이터를 받을때 가독성을 높이기위해 정렬시켜주는 메소드
app.set("json spaces", 2);

app.get("/shipping/:invc_no", async (req, res) => {
  try {
    //대한통운의 현재 배송위치 크롤링 주소
    const url = `https://www.doortodoor.co.kr/parcel/ \
        doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=${req.params.invc_no}`;
    let result = []; //최종 보내는 데이터

    const html = await request(url);
    const $ = cheerio.load(
      html,
      { decodeEntities: false } //한글 변환
    );

    const tdElements = $(".board_area").find("table.ptb10.mb15 tbody tr td"); //td의 데이터를 전부 긁어온다
    //최종적으로 crawling할 data는 배열인지, 객체인지 어디서 가져와야하는지 해당 사이트에서 직접 확인하고
    //위치를 적절하게 탐색/파악하여 인덱스 번호 알아야 된다(이 쯤의 인덱스가 해당 daa가 있을 것이다)
    //실제 데이터가 있는지 인덱스/객체 등 터미널로 확인하면서 받아올것!
    //trim() : 띄어쓰기 등 잘라내기
    //children만 보면 index=0 배열에는 배달지도착 인폼, 2 배열에는 배송자 정보가 들어가있음
    console.log(tdElements[10].children[2].data);
    //<a>태그안의 담당점소는 children -> children.
    console.log(tdElements[3].children[1].children[0].data);
    //data를 가져오기전에 먼저 패턴을 파악한디.
    //패턴을 파악하고 반복문을 구현한다.

    //전체 데이터 가져오기
    //1줄을 temp에 넣고 이를 result에 넣어 저장, 초기화, 반복.
    var temp = {};
    for (let i = 0; i < tdElements.length; i++) {
      if (i % 4 == 0) {
        //배달담당자
        //temp 초기화
        temp = {};
        temp["step"] = tdElements[i].children[0].data.trim();
      } else if (i % 4 == 1) {
        //날짜
        temp["date"] = tdElements[i].children[0].data;
      } else if (i % 4 == 2) {
        temp["status"] = tdElements[i].children[0].data;
        if (tdElements[i].children.length > 1) {
          temp["status"] = temp["status"] + tdElements[i].children[2].data;
        }
      } else if (i % 4 == 3) {
        temp["location"] = tdElements[i].children[1].children[0].data;
        //마지막 단계에서 최종적으로 result에 담고
        result.push(temp);
      }
    }
    //res.send = res.json
    res.json(result);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, function () {
  console.log("Express listening on port ", port);
});
