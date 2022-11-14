import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { home, search } from "../controllers/photoController";
import { protectorMiddleware, publicOnlyMiddleware, adminOnlyMiddleware } from "../middlewares";
import User from "../models/User";
import Photo from "../models/Photo";
import Order from "../models/Order";

const globalRouter = express.Router();

globalRouter.use(bodyParser.json());
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
globalRouter.route("/payments/complete").post(async (req, res) => {
  try {
    const { imp_uid, merchant_uid, name, username, useremail, title, id } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: "1012162520373434", // REST API 키
        imp_secret: `${process.env.REST_API_SECRET}`
      }// REST API Secret
    });

    //console.log("get token success");     
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
    //console.log(paymentData.merchant_uid);
    //const order = await Orders.findById(paymentData.merchant_uid);
    const order = await Photo.findById(id);
    const amountToBePaid = order.price;

    //const amountToBePaid = order.amount; // 결제 되어야 하는 금액
    // 결제 검증하기
    const { amount, status } = paymentData;
    //console.log(typeof(amount), typeof(amountToBePaid)  );
    if (amount === parseInt(amountToBePaid)) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
      //await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장
      await Order.create({
        date: `${new Date().getFullYear()}.${new Date().getMonth()}.${new Date().getDay()}`,
        buyer_name: name,
        buyer_email: useremail,
        title,
        price: amount,
        merchant_uid,
      });
      // console.log(req.session);
      const orderData = await Order.findOne({ merchant_uid });
      //console.log(orderData);
      const userInfo = await User.findOne({ username });

      userInfo.buylist.push(title);
      await userInfo.save();

      switch (status) {
        case "paid": // 결제 완료
          res.send({ status: "success", message: "일반 결제 성공" });
          break;
      }
    } else { // 결제 금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    console.log("error 발생 :", e);
  }
});

globalRouter.route("/mobile/complete").post(async (req, res) => {
  try {
    const { imp_uid, merchant_uid, name, username, useremail, title, id } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: "1012162520373434", // REST API 키
        imp_secret: `${process.env.REST_API_SECRET}`
      }// REST API Secret
    });

    //console.log("get token success");     
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
    //console.log(paymentData.merchant_uid);
    //const order = await Orders.findById(paymentData.merchant_uid);
    const order = await Photo.findById(id);
    const amountToBePaid = order.price;

    //const amountToBePaid = order.amount; // 결제 되어야 하는 금액
    // 결제 검증하기
    const { amount, status } = paymentData;
    //console.log(typeof(amount), typeof(amountToBePaid)  );
    if (amount === parseInt(amountToBePaid)) { // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
      //await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData }); // DB에 결제 정보 저장
      await Order.create({
        date: `${new Date()}`,
        buyer_name: name,
        buyer_email: useremail,
        title,
        price: amount,
        merchant_uid,
      });
      const orderData = await Order.findOne({ merchant_uid });
      //console.log(orderData);
      const userInfo = await User.findOne({ username });
      userInfo.buylist.push(title);
      await userInfo.save();

      switch (status) {
        case "paid": // 결제 완료
          res.send({ status: "success", message: "일반 결제 성공" });
          break;
      }
    } else { // 결제 금액 불일치. 위/변조 된 결제
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    console.log("error 발생 :", e);
  }
});

export default globalRouter;
