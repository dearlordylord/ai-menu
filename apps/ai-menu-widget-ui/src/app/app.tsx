import styled from '@emotion/styled';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Widget } from './widget';

const queryClient = new QueryClient();

const StyledApp = styled.div`
  // Your style here
`;

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StyledApp>
        <Widget />
      </StyledApp>
    </QueryClientProvider>
  );
}

export default App;
