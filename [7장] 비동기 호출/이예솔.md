# 7.1 API 요청

## fetch로 API 요청

fetch 함수를 사용하여 외부 데이터 베이스에 접근하여 사용자가 장바구니에 추가한 정보를 호출하는 코드는 다음과 같다.

```tsx
const CartBadge: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  useEffcet(() => {
    fetch('카트정보 URL').then(({ cartItem }) => {
      setCartCount(cartItem.length);
    });
  }, []);
};
```

카트 정보 URL을 사용하여 장바구니 개수를 보여주거나, 장바구니의 담긴 물건들을 보여주는 컴포넌트를 구현하는 등 여러곳에서 사용한다고 가정해보자.

이때 만약 백엔드에서 기능을 변경해야해서 API를 수정할 경우 이미 컴포넌트 내부 깊숙이 자리 잡은 비동기 호출 코드는 변경 요구에 취약할 수 있다.

URL변경 뿐 아니라 모든 요청에 커스텀 헤더가 필요하다 같은 새로운 API 요청 정책이 추가 될 때마다 계속해서 비동기 호출을 수정해야하는 번거로움이 생긴다.

## 서비스 레이어 분리

여러 API 요청 정책이 추가되어 코드가 변경될 수 있다는 점을 감안하면 비동기 호출 코드는 컴포넌트 영역에서 분리되어 서비스레이어에서 처리되어야 한다.

앞의 코드 기준으로는 fetch함수를 호출하는 부분이 서비스 레이어로 이동하고 컴포넌트는 서비스 레이어의 비동기 함수를 호출하여 그 결과를 받아와 렌더링 하는 흐름이 된다.

하지만 단순히 fetch 함수를 분리한다고 API요청 정책이 추가되는 것을 해결하기는 어렵다.

## Axios사용

tetch는 내장 라이브러리이기 때문에 따로 임포트나 설치의 필요없이 바로 사용할 수 있다. 하지만 많은 기능을 사용하기 위해서는 직접 구현을해야한다. 이러한 번거로움 때문에 fetch대신 많이 쓰이는 것이 Axios 라이브러리다.

각 서버가 담당하는 부분이 다르거나 새로운 프로젝트의 일부로 포함될 때 기존에 사용하는 API Entry와는 다른 새로운 URL로 요청해야 하는 상황이 생길 수 있다.

이처럼 API Entry가 2개 이상인 경우에는 각 서버의 기본 URL을 호출하도록 2개 이상의 API 요청을 처리하는 인스턴스를 구성해야한다. 이후 다른 URL로 서비스 코드를 호출할 때는 각각의 apiRequester를 사용하면 된다.

```tsx
//기본적인 API 엔트리를 사용하는 Axios 인스턴스
const apiRequester: AxiosInstance = axios.create(defaultConfig);

//다른 API 엔트리인 "https://api.baemin.or/" 주소로 요청을 보내기 위한 Axios 인스턴스
const orderApiRequester: AxiosInstance = axiost.create({
  baseURL: 'https://api.baemin.or/',
  ...defaultConfig,
});

//다른 API 엔트리인 "https://api.order/" 주소로 요청을 보내기 위한 Axios 인스턴스
const orderCartApiRequester: AxiosInstance = axios.create({
  baseURL: 'https://api.order/',
  ...defaultConfig,
});
```

## Axios interceptors

각각의 requester는 서로 다른 역할을 담당하는 다른 서버이기 때문에 requester별로 커스텀 헤더를 설정해줘야하는 로직이 필요할 수 있다.

이때 axios에서 제공하는 interceptors기능을 사용하여 requester에 따라 비동기 호출 내용에 추가해서 처리할 수 있다. 또한 API에러를 처리할 때 하나의 에러 객체로 묶어서 처리할 수도 있다.

```tsx
// 요청을 보내기 전 실행
axios.interceptors.request.use();

// 응답을 받은 후 실행
axios.interceptors.response.use();
```

```tsx
// API 엔트리로 요청을 보내기 위한 Axios 인스턴스를 생성하고, 요청 시에 5초 동안 대기하는 timeout 설정
const apiRequester : AxiosInstance = axiost.create({
    baseURL:"https://api.baemin.com/",
    timeout:5000
});

// Axios 요청 구성(config)에 특정 헤더 값을 추가하는 함수
const setRequesterDefaultHeader = (requestConfig: AxiosRequestConfig) => {
    const config = requestConfig;

    config.headers = {
        ...config.headers,
        "Content-Tyep":"application/json;charset=utf8",
        user:getUserToken(),
        agent:getAgent()
    }

    return config;
}


// Axios 주문 요청 구성(config)에 특정 헤더 값을 추가하는 함수
const setOrderRequesterDefaultHeader = (requestConfig: AxiosRequestConfig) => {
    const config = requestConfig;

    config.headers = {
        ...config.headers,
        "Content-Tyep":"application/json;charset=utf8",
        "order-client": getOrderClienToken();
    }

    return config;
}

// apiRequester에 요청 전에 setRequesterDefaultHeader 함수를 호출하여
// 기본 헤더 값을 설정하는 Axios 요청 인터셉터(interceptors)
apiRequester.interceptors.request.use(setRequesterDefaultHeader)


// 주문 API를 위한 Axios 인스턴스를 생성하고,
// 해당 API의 기본 URL과 기본 설정인 defaultConfig를 사용
const orderApiRequester: AxiosInstance = axios.create({
    baseURL:orderApiBaseUrl,
    ...defaultConfig,
})

//orderApiRequester에 요청 전에 setOrderRequesterDefaultHeader 함수를 호출하여 주문 API 전용 헤더 값을 설정하는 Axios 요청 인터셉터가 등록
orderApiRequester.interceptors.reuquest.use(setOrderRequesterDefaultHeader)

// 응답을 처리하는데 있어서 httpErrorHandler를 사용하도록 설정
orderApiRequester.interceptors.response.use({
    (response: AxiosResponse) => response,
    httpErrorHandler
})

//주문 카트 API를 위한 Axios 인스턴스를 생성하고, 해당 API의 기본 URL과 기본 설정인 defaultConfig를 사용
const orderCartApiRequester: AxiosInstance = axios.create({
    baseURL:orderCartApiBaseUrl,
    ...defaultConfig,
})

//orderCartApiRequester에 요청 전에 setRequesterDefaultHeader 함수를 호출하여 기본 헤더 값을 설정하는 Axios 요청 인터셉터가 등록
orderCartApiRequester.interceptors.request.use(setRequesterDefaultHeader);

```

이와 달리 요청 옵션에 따라 다른 인터셉터를 만들기 위해 빌더 패턴을 추가하여 APIBulder같은 클래스 형태로 구성하기도 한다.

- **빌더패턴**: 객체생성을 더 편리하고 가독성 있게 만들기 위한 디자인 패턴 중 하나, 주로 복잡한 객체의 생성을 단순화 하고 객체 생성 과정을 분리하여 객체를 조립하는 방법을 제공한다.

## API 응답 타입 지정

같은 서버에서 오는 응답의 형태는 대체로 통일되어있다. 그래서 앞서 소개한 API의 응답 값은 하나의 Response 타입으로 묶일 수 있다.

```tsx
interface Response<T> {
  data: T;
  status: string;
  serverDateTime: string;
  errorCode?: string;
  errorMessage?: string;
}

// 카트 정보를 가져오기 위한 API 요청
// AxiosPromise를 반환하며, 해당 Promise의 제네릭 타입은 Response<FetchCartResponse>로 정의
// FetchCartResponse는 서버에서 받아온 카트 정보에 대한 타입
const fetchCart = (): AxiosPromise<Response<FetchCartResponse>> => {
  apiRequester.get < Response < FetchCartResponse >> 'cart';
};

// 카트에 데이터를 추가하거나 업데이트하기 위한 API 요청
// AxiosPromise를 반환하며, 해당 Promise의 제네릭 타입은 Response<PostCartResponse>로 정의
// PostCartResponse는 서버에서 받아온 카트에 대한 업데이트 결과에 대한 타입
const postCart = (
  postCartRequest: PostCartRequest
): AxiosPromise<Response<PostCartResponse>> => {
  apiRequester.post<Response<PostCartResponse>>('cart', postCartRequest);
};
```

하지만 서버에서 오는 응답을 통일할 때 주의점이 있다. Response의 타입을 apiRequester내에서 처리하고 싶은 생각이 들 수 있는데 이렇게 하면 update나 create같이 응답이 없을 수 잇는 API를 처리하기 까다로워진다.

```tsx
const updateCart = (
  updateCartRequest
): AxiosPromise<Response<FetchCartResponse>> => apiRequester.get<null>('cart');
```

따라서 Response 타입은 apiRequester가 모르게 관리되어야 한다.

## 뷰모델 사용

프로젝트 초기에는 서버 스펙이 자주 바뀐다. 이때 뷰모델을 사용하여 API 변경에 따른 범위를 한정해주는 것이 좋다.

좋은 컴포넌트는 변경될 이유가 하나뿐인 컴포넌트라고 말한다. API 응답으로 인해 수정해야할 컴포넌트가 API 1개당 하나라면 좋겟지만 API를 사용하는 기존 컴포넌트도 수정되어야 한다. 이러한 문제를 해결하기 위한 방법으로 뷰모델을 도입할 수 있다.

```tsx
interface JobListItemResponse {
  name: string;
}

interface JobListResponse {
  jobItems: JobListItemResponse[];
}

class JobList {
  readonly totalItemCount: number;
  readonly items: JobListItemResponse[];

  constructor({ jobItems }: JobListResponse) {
    this.totalItemCount = jobiItems.length;
    this.items = jouItems;
  }
}

const fetchJobList = async (
  filter?: ListFetchFilter
): Promise<JobListResponse> => {
  const { data } = await api
    .params({ ...filter })
    .get('/apis/get-list-summaries')
    .call<Response<JobListResponse>>();

  return new JobList(data);
};
```

# 7.2 API 상태관리하기

## 상태관리 라이브러리에서 호출하기

상태관리 라이브러리의 비동기 함수들은 서비스 코드를 사용하여 비동기 상태를 변화시킬 수 있는 함수를 제공한다

서비스코드: 액션생성자, 비동기작업을 수행하고 애플리케이션의 상태를 업데이트하는 역할

컴포넌트는 이러한 함수르 사용하여 상태를 구독하며, 상태가 변경될 때 컴포넌트를 다시 렌더링 하는 방식으로 동작한다.

## 훅으로 호출하기

react-query나 useSwr 같은 훅을 사용한 방법은 훅을 사용하여 비동기 함수를 호출하고 상태관리 라이브러리에서 발생한 의도치 않은 상태 변경을 방지하는 데 큰 도움이 된다.

```tsx
// Job 목록을 불러오는 훅

// ["fetchJobList"] 키를 가진 캐시 쿼리를 생성하며, 해당 쿼리는 JobService.fetchJobList를 호출하여 직업 목록을 가져옴
const useFetchJobList = () => {
  return useQuery(['fetchJobList'], async () => {
    const response = await JobService.fetchJobList();

    //서버 응답을 받아서 JobList 뷰모델을 생성하고 반환
    return new JobList(response);
  });
};

const useUpdateJob = (
  id: number,
  { onSucess, ...options }: UseMutationOptions<void, Error, JobUpdateFormValue>
): UseMutationResult<void, Error, JobUpdateFormValue> => {
  const queryClient = useQueryClient();

  // ["update", id] 키를 가진 캐시 쿼리를 만들어 업데이트 된 데이터를 관리
  return useMutation(
    ['update', id],
    async (jobUpdateForm: JobUpdateFormValue) => {
      //JobService.updateJob를 호출하여 서버에 업데이트를 요청
      await JobService.updateJob(id, jobUpdateForm);
    },
    {
      onSuccess: (data: void, values: JobUpdateFormValue, context: unknown) => {
        // "fetchJobList" 쿼리를 무효화시켜 재조회를 유도
        queryClient.invalidateQueries(['fetchJobList']);

        onSuccess && onSuccess(data, values, context);
      },
      ...options,
    }
  );
};
```

이후 컴포넌트에서는 일반적인 훅을 호출하는 것처럼 사용하면 된다. JobList 컴포넌트가 반드시 최신 상태가 되도록 표현하려면 폴링이나 웹소켓을 사용하면 된다.

상태관리 라이브러리에서는 비동기로 상태를 변경하는 코드가 추가되면 전역 상태 관리 스토어가 비대해지기 때문에 상태를 변경하는 액션이 증가하는 것뿐만 아니라 전역 상태 자체가 복잡해진다. 이러한 이유때문에 react-query로 변경하려는 시도가 이루어지고 있다.

하지만 react-query는 전역 상태 관리를 위한 라이브러리가 아니기에 어떤 상태 라이브러리를 선택할지는 프로젝트의 성격에 따라 달라질 수 있다.

상태관리 라이브러리에 고정된 모범 사례가 있는 것은 아니기에 적절한 판단이 필요하다.

# 7.3 API 에러 핸들링

비동기 API호출에서는 상태 코드에 따라 401,404,500,cors에러 등 다양한 에러가 발생할 수 있다.

이때 에러 상황에 대한 명시적인 코드 작성시 유지보수가 용이해지고 사용자에게도 구체적인 에러 상황을 전달할 수 있다.

## 타입 가드 활용하기

Axios 라이브러리에서는 Axios 에러에 대해 isAxiosError라는 타입 가드를 제공하고 있다. 이때 서버 에러임을 명확하게 표시하고 서버에서 내려주는 에러 응답 객체에 대해서도 구체적으로정의함으로써 에러 객체가 어떤 속성을 가졌는지 파악할 수 있다.

```tsx
// 공통 에러객체에 대한 타입

interface ErrorResponse {
  status: string;
  serverDateTime: string;
  errorCode: string;
  errorMessage: string;
}
```

`ErrorResponse` 인터페이스를 사용하여 `AxiosError<ErrorResponse>`형태로 Axios의 에러를 표현할 수 있고 다음과 같이 사용자 정의 타입가드를 사용하여 명시적으로 작성할 수 있다.

```tsx
function isServerError(error: unknown): error is AxiosError<ErrorResponse> {
  return axios.isAxiosError(error);
}

const onClickDeleteHistoryButton = async (id: string) => {
  try {
    await axios.post('URL', { id });
    alert('주문내역 삭제');
  } catch (e: unknown) {
    // 에러가 Axios 에러이며 ErrorResponse의 형태를 지니고 있고, 서버 응답이 존재하며, 그 응답에는 errorMessage 속성이 존재하는 경우
    if (isServerError(e) && e.response && e.response.data.errorMessage) {
      // true일 경우 명시적으로 서버 에러를 처리하고 에러 메시지를 설정
      setErrorMessage(e.response.data.errorMessage);
    }
    // false일 경우 일반적인 일시적인 에러 메시지를 설정
    setErrorMessage('일시적인 에러가발생했습니다. 잠시 후 다시 시도해주세요');
  }
};
```

## 에러 서브 클래싱 하기

요청을 처리할 때 단순 서버 에러 뿐만 아니라 인증, 네트워크, 타임아웃 등 다양한 에러가 발생할 수 있다. 이를 더욱 명시적으로 표시하기 위해 서브클래싱을 활용할 수 있다.

서브클래싱: 기존 클래스를 확장하여 새로운 하위 클래스를 만드는 과정.
새로운 클래스는 상위 클래스의 모든 속성과 메서드를 상속받아 사용할 수 있고 추가적인 속성과 메서드를 정의할 수 있다.

```tsx
const getOrderHistory = async (page:number) => Promise<History> {
  try {
    const data = await axios.get("APIURL");
    const history = await JSON.parse.(data);
    } catch (e) {
      alert(e.message)
    }
  }
```

위의 코드는 주문내역을 호출하는 함수이다. 여기에서 에러가 발생하면 `alert`를 사용하여 에러 메세지를 사용자에게 보여준다.

하지만 해당 에러는 개발자 입장에서는 사용자 로그인 정보가 만료된것인지 타임아웃이 발생한것인지 아니면 다른 이유때문인지 구분할 수 없다.

이때 서브클래싱을 사용하여 코드상에서 어떤 에러가 발생한것인지 바로 확인할 수 있으며 에러 인스턴스가 무엇인지에 따라 에러 처리 방식을 다르게 구현할 수 있다.

```tsx
class OrderHttpError extends Error {

  private readonly privateResponse: AxiosResponse<ErrorResponse : undfiend>

  constructor(message?: string, response?:AxiosResponse<ErrorResponse>){
    super(message);
    this.name = "OrderHttpError"
    this.privateResponse = response
  }

  get response(): AxiosResponse<ErrorResponse> | undfined {
    return this.privateResponse
  }
}

class NetworError extends Error{
    constructor(message: ""){
    super(message);
    this.name = "NetworkError"
  }
}

class UnauthorizedError extends Error{
    constructor(message?: string, response?:AxiosResponse<ErrorResponse>){
    super(message, response);
    this.name = "Unauthorized"
  }
}
```

다음은 위에서 작성한 서브클래싱을 사용하여 에러들을 처리한 예시이다.
해당 코드는 좀 더 쉬운 이해를 위해 새롭게 생성한 코드다.

```tsx
// 주문 내역 가져오기
const fetchOrderHistory = async () => {
  try {
    const response = await apiRequester.get('/order-history');
    console.log('Order history data received:', response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response) {
        const { status, data } = error.response;
        const { errorCode, errorMessage } = data;

        if (status === 401) {
          // UnauthorizedError
          throw new UnauthorizedError(errorMessage, error.response);
        } else {
          // OrderHttpError
          throw new OrderHttpError(errorMessage, error.response);
        }
      } else if (error.request) {
        // 요청 전송 후 응답이 없는 경우
        throw new NetworkError('No response received');
      } else {
        // 요청 전송 전에 에러가 발생한 경우
        throw new NetworkError('Request error');
      }
    } else {
      // Axios 에러가 아닌 경우
      throw error;
    }
  }
};
```

## 인터셉터를 활용한 에러 처리

axios같은 페칭 라이브러리는 인터셉터 기능을 제공한다. 이를 사용하면 HTTP에러에 일관된 로직을 적용할 수 있다.

`axios.interceptors.response.use():` `use` 함수에는 두 개의 콜백 함수를 매개변수로 전달할 수 있음

- 첫 번째 함수 (onFulfilled): 이 함수는 성공적으로 응답을 받았을 때 호출

- 두 번째 함수 (onRejected): 이 함수는 응답이 실패했을 때, 즉 HTTP 요청이 실패하거나 서버에서 에러 응답을 반환했을 때 호출

```tsx
const httpErrorHandler = (
  error: AxiosError<ErrorResponse> | Error
): Promise<Error> => {
  (error) => {
    if (error.response && error.response.stauts === '401') {
      window.location.href = `/login`;
    }
    return Promise.reject(error);
  };
};

orderApiRequester.interceptors.response.use(
  // 응답 성공시
  (response: AxiosResponse) => response,
  // 응답 실패시 httpErrorHandler() 호출
  httpErrorHandler
);
```

## 에러 바운더리를 활용한 에러 처리

에러 바운더리는 리액트 컴포넌트트리에서 에러가 발생할 때 공통으로 에러를 처리하는 리액트의 컴포넌트이다.

에러 바운더리를 사용하면 해당 컴포넌트의 하위에 있는 컴포넌트에서 발생한 에러를 캐치하고 해당 에러를 가장 가까운 부모 에러 바운더리에서 처리할 수 있다.

에러 바운더리는 에러가 발생한 컴포넌트 대신에 에러 처리를 하거나 예상치 못한 에러를 공통 처리할 때 사용할 수 있다.

다음은 예시 코드이다.

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('에러가 발생했습니다:', error, errorInfo);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // 에러가 발생했을 때 에러 페이지를 보여줄 수 있는 컴포넌트를 리턴
      return <ErrorPage />;
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <OrderHistoryPage />
    </ErrorBoundary>
  );
}

export default App;
```

이처럼 에러바운더리를 사용하면 OrderHistoryPage 컴포넌트 내부에서 처리되지 않은 에러가 있을때 에러바운더리인 상위 컴포넌트가 componentDidCatch를 통해 에러를 잡아내어 에러페이지를 내보낼 수 있다. 이외에도 에러 바운더리에 로그를 보내는 코드를 추가하여 예상치못한 에러의 발생 여부를 추적할 수 있다.

## 상태 관리 라이브러리에서의 에러 처리

## react-query를 활용한 에러 처리

react-query나 swr과 같은 데이터 페칭 라이브러리를 사용하면 요청에 대한 상태를 반환해주기 때문에 요청 상태를 확인하기 쉽다.

```tsx
const JobComponent: React.FC = () => {
  // 요청에 대한 상태를 반환
  const { isError, error, isLoading, data } = useFetchJobList();

  // 에러 발생
  if (isError) {
    return <div>{`${error.message}`}가 발생했습니다. 다시 시도해주세요</div>;
  }

  // 로딩
  if (isLoading) {
    return <div>로딩 중입니다</div>;
  }

  // 정상적으로 실행시 화면에 데이터 출력
  return (
    <>
      {data.map((job) => (
        <JobItem key={job.id} job={job} />
      ))}
    </>
  );
};
```

## 그 밖의 에러 처리

보통 200번대 에러는 API의 성공 응답을 나타낸다. 하지만 비즈니스 로직에서 유효성 검증에 의해 추가된 커스텀 에러는 200번대 응답과 함께 응답 바디에 별도의 상태 코드를 전달하기도 한다.

```tsx
// 보통은 API 성공 응답, 여기서는 커스텀 에러로 사용
httpStatus:200
{
  "status":"C2005",// 응답 바디에 별도의 상태 코드와 메세지 전달
  "message":"장바구니에 품절된 메뉴가 있습니다"
}
```

이러한 에러를 처리하기 위해서는 요청 함수 내에서 조건문으로 status를 비교할 수 있다.

하지만 이렇게 처리해야하는 API가 많을 경우에는 매번 조건문을 추가하여 에러를 처리해야한다.

이때 Axios등의 라이브러리를 사용하면 특정 호스트에 대한 requester를 별도로 선언하고 상태 코드 비교 로직을 인터셉터에 추가할 수 있다.

```tsx
const apiRequester: AxiosInstance = axiost.create({
  baseorderAURL: orderApiBaseUrl,
  ...defaultConfig,
});

export const httpSuccesHandelr = (response: AxiosResponse) => {
  if (response.data.status !== 'SUCCESS') {
    throw new CustomError(response.data.message, response);
  }

  return response;
};

apiRequester.interceptors.response.use(httpSuccesHandelr, httpErrorHandler);

const createOrder = (data: CreateOrderData) => {
  try {
    const response = apiRequester.post('PostUrl', data);
    httpSuccesHandelr(response);
  } catch (e) {
    httpErrorHandler(e);
  }
};
```

# 7.4 API 모킹

프론트엔드 개발 시 현실적으로는 프론트엔드 개발이 서버 개발보다 먼저 이루어지거나 서버개발과 동시에 이루어지는 경우가 더 많다.

하지만 프론트엔드 입장에서는 서버 API가 필요한 상황이라면 프론트 엔드 개발을 어떻게 진행할 수 있을까?

서버가 별도의 가짜 서버를 제공한다고 해도 프론트엔드 개발과정에서 발생할 수 있는 모든 예외 상황을 처리하는 것은 쉽지않다. 이때 사용하는 것이 모킹`mocking`이다.

모킹은 가짜 모듈을 활용하는 것이다. 테스트뿐만 아니라 개발할 때도 모킹을 사용할 수 있다.

## JSON파일 불러오기\*

간단한 조회만 필요한 경우에는 \*.json 파일을 만들거나 자바스크립트 파일 안에 JSON형식의 정보를 저장하고 익스포트 하는 방식을 사용하면 된다.

이후 get요청에 파일 경로를 삽입해주면 조회 응답으로 원하는 값을 받을 수 있다.

```tsx
const SERVICES: Service[] = [
  {
    id: 0,
    name: '우아한',
  },
  {
    id: 1,
    name: '형제들',
  },
];
```

이 방법은 별도으이 환경설정 없이 쉽게 구현할 수 있어 프로젝트 초기 단계에서 빠른 목업을 구축해야 할 경우 사용할 수 있다. 하지만 실제 API로 요청하는 것이 아니기 때문에 추후 요청 경로를 변경해야한다.

## NextApiHandeler 활용하기

Next.js를 사용하는 프로젝트의 경우 NextJS에서 제공하는 NextApiHandeler를 활용할 수 있다.

핸들러를 정의하여 응답하고자 하는 값을 정의하고, 핸들러 안에서 요청에 대한 응답을 정의할 수 있다. 또한 핸들러 함수 내부에서 추가로직을 작성하여 응답 처리 로직을 추가할 수 있다.

```tsx
import { NextApiHandler } from 'next';

// 응답 정의
const BRANDS: Brand[] = [
  {
    id: 0,
    name: '배민스토어',
  },
  {
    id: 1,
    name: '비마트',
  },
];

const handler: NextApiHandler = (req, res) => {
  // 추가 로직 작성

  // 요청에 대한 응답 정의
  res.json(BRANDS);
};

export default handler;
```

## API 요청 핸들러에 분기 추가하기

요청 경로를 수정하지 않고 개발에 필요한 경우에만 실제 요청을 보내고 평소에는 목업을 사용하여 개발하고 싶다면 API 요청을 훅 또는 별도의 함수로 선언해준 다음 조건에 따라 목업 함수를 내보내거나 실제 요청 함수를 내보낼 수 있다.

```tsx
// useMock과 if문을 사용하여 목업데이터를 사용하는 케이스와 실제 서버로 API를 호출하는 분기를 나눔
const fetchBrands = () => {
  if (useMock) {
    // 목업데이터를 fetch하는 함수
    return mockFetchBrands();
  }
  // 서버에서 API 호출
  return requester.get('/brands');
};
```

## axios-mock-adapter로 모킹하기

서비스 함수에 분기문이 추가되는 것을 바라지 않는다면 라이브러리를 사용하면 된다.

axios-mock-adapters는 `onGet`을 사용하여 HTTP 메서드(GET, POST, PUT, 등) 및 엔드포인트에 대한 요청을 가로채고 `reply`를 통해 해당 요청에 대한 목업 응답을 설정하고 반환한다.

```tsx
// axios 및 axios-mock-adapter 가져오기
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Axios Mock Adapter 인스턴스 생성
const mock = new MockAdapter(axios);

// Mock 데이터 정의
const mockData = [
  { id: 1, name: 'Mock Brand 1' },
  { id: 2, name: 'Mock Brand 2' },
];

export const fetchBrandListMock = () => {
  // 특정 엔드포인트에 대한 GET 요청을 가로채고 목업 응답 반환
  mock.onGet('/brands').reply(200, mockData);
};
```

axios-mock-adapter를 사용하면 GET뿐만 아니라 POST, PUT, DELETE 등 다른 http 메서드에 대한 목업을 작성할 수 있다. 또한 networkError, timeoutError 등을 메서드로 제공하기 때문에 다음과 같이 임의로 에러를 발생시킬 수도 있다.

```tsx
export const fetchBrandListMock = () => {
  mock.onGet('/brands').networkError();
};
```

## 목업 사용 여부 제어하기

로컬에서 목업을 사용하고 dev나 운영환경에서는 사용하지 않으려면 플래그를 사용하여 목업을 사용하는 상황을 구분할 수 있다.

```tsx
const useMock = process.env.REACT_APP_MOCK === 'true';

const mockFn = ({ status = 200, time = 100, use = true }: MockResult) =>
  use &&
  mock.onGet('').reply(() =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          status,
          status === 200 ? fetchBrandSuccessResponse : undefined,
        ]);
      }, time)
    );
  );

  if (useMock){
    mockFn({status:200,time:100,use:true})
  }
```

또한 플래그에 따라 mockFn을 제어할 수 있는데 매개 변수를 넘겨 특정 mock 함수만 동작하게 하거나 동작하지 않게 할 수 있다.

만약 스크립트 실행 시 구분 짓고자 한다면 package.json에서 관련 스크립트를 추가할 수 있다

```json
{
  ...,
  "scripts":{
    ...,
    "start:mock":"REACT_APP_MOCK=true npm run start",
    "start":"REACT_APP_MOCK=false npm run start",
  }}
```

이렇게 자바스크립트 코드의 실행 여부를 제어하지 않고 config 파일을 별도로 구성하거나 프록시를 사용할 수 있다.

axios-mock-adapter는 API를 중간에 가로채는 것으로 실제 API요청을 주고 받지 않는다. 따라서 API 요청의 흐름을 파악하기 위해서는 react-query-devtools 혹은 redux test tool과 같은 도구의 힘을 빌려야한다.