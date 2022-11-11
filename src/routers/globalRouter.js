import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { home, search } from "../controllers/photoController";
import { protectorMiddleware, publicOnlyMiddleware, adminOnlyMiddleware } from "../middlewares";

const globalRouter = express.Router();

globalRouter.get("/", adminOnlyMiddleware, home);
globalRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(getJoin)
  .post(postJoin);
globalRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
globalRouter.get("/search", search);
globalRouter.post("/payments/complete", async (req, res) => {
  console.log("json in the server");
  try {
    const { imp_uid, merchant_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    console.log(imp_uid, merchant_uid);

    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "POST", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
          imp_key: "1012162520373434", // REST API 키
          imp_secret: `${process.env.REST_API_SECRET}`// REST API Secret
        }
    });
    console.log("get token success");      // ----------> 출력 안됨
    const { access_token } = getToken.data.response; //인증 토큰
    // imp_uid로 아임포트 서버에서 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    //console.log(paymentData);
    // DB에서 결제되어야 하는 금액 조회
    console.log(paymentData.merchant_uid);
    const order = await Orders.findById(paymentData.merchant_uid);
    const amountToBePaid = order.amount; // 결제 되어야 하는 금액
    
    // 결제 검증하기
    const { amount, status } = paymentData;
    if (amount === amountToBePaid) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
      await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장

      switch (status) {
        case "ready": // 가상계좌 발급
          // DB에 가상계좌 발급 정보 저장
          const { vbank_num, vbank_date, vbank_name } = paymentData;
          await Users.findByIdAndUpdate("/* 고객 id */", { $set: { vbank_num, vbank_date, vbank_name }});
          // 가상계좌 발급 안내 문자메시지 발송
          SMS.send({ text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} \${vbank_date} \${vbank_name}`});
          res.send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
          break;
        case "paid": // 결제 완료
          res.send({ status: "success", message: "일반 결제 성공" });
          break;
      }
    } else { // 결제 금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
      console.log("error 발생");
  }
});

export default globalRouter;
