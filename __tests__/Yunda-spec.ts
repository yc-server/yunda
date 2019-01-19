import * as crs from 'crypto-random-string';
import { Yunda, EOrderType } from '../src';
import axios from 'axios';

const partnerid = '201883123456';
const password = 'BSnMXYd7F3DurPwUJ9tZAy4KR6Gheq';
const version = '1.4';
const endpoint =
  'http://orderdev.yundasys.com:10110/cus_order/order_interface/interface_receive_order__mailno.php';

const post = jest.fn();
axios.post = post;

test('Should convert obj to xml', () => {
  const yunda = new Yunda(partnerid, password, version, endpoint);
  const oStr = yunda.parseOrder2Xml({
    order_serial_no: '1',
    khddh: '2',
    order_type: EOrderType.common,
    sender: {
      name: 'sender',
      address: 'here',
    },
    receiver: {
      name: 'sender',
      address: 'there',
    },
    items: [
      {
        item: {
          name: 'item - 1',
          number: '1',
          remark: '',
        },
      },
    ],
  });
  expect(oStr).toBe(
    '<orders><order><order_serial_no>1</order_serial_no><khddh>2</khddh><order_type>common</order_type><sender><name>sender</name><address>here</address></sender><receiver><name>sender</name><address>there</address></receiver><items><item><name>item - 1</name><number>1</number><remark/></item></items></order></orders>'
  );
});

test('Should create an order', async () => {
  const yunda = new Yunda(partnerid, password, version, endpoint);
  post.mockResolvedValue({
    data:
      '<responses><response><mail_no>4060005454879</mail_no><pdf_info>xxx</pdf_info><status>1</status><msg>创建订单成功</msg></response></responses>',
  });

  const res = await yunda.createOrder({
    order_serial_no: crs(10),
    khddh: crs(10),
    order_type: EOrderType.common,
    sender: {
      name: 'sender',
      address: 'here',
    },
    receiver: {
      name: 'sender',
      address: 'there',
    },
    items: [
      {
        item: {
          name: 'item - 1',
          number: '1',
          remark: '',
        },
      },
    ],
  });

  const obj = {
    mail_no: '4060005454879',
    pdf_info: 'xxx',
    status: '1',
    msg: '创建订单成功',
  };

  expect(res).toMatchObject(obj);
});
