import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import ContextWrapper from './context/ContextWrapper';

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 8, 13, 12));
});

afterEach(() => {
  jest.useRealTimers();
});

const renderCalendar = () => render(<ContextWrapper><App /></ContextWrapper>);

test('navigates calendar months and returns to today', () => {
  renderCalendar();
  expect(screen.getByRole('heading', { name: 'September 2026' })).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'chevron_right' })[0]);
  expect(screen.getByRole('heading', { name: 'October 2026' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Today' }));
  expect(screen.getByRole('heading', { name: 'September 2026' })).toBeInTheDocument();
});

test('creates, persists, filters, updates, and deletes a calendar event', () => {
  renderCalendar();
  fireEvent.click(screen.getByRole('button', { name: /Create/ }));
  fireEvent.change(screen.getByPlaceholderText('Add Title'), { target: { value: 'SVG migration review' } });
  fireEvent.change(screen.getByPlaceholderText('Add a location'), { target: { value: 'Meeting room' } });
  fireEvent.change(screen.getByPlaceholderText('Add a description'), { target: { value: 'Review the build' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('SVG migration review')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('savedEvents'))).toEqual([
    expect.objectContaining({ title: 'SVG migration review', location: 'Meeting room', description: 'Review the build', label: 'indigo' }),
  ]);

  fireEvent.click(screen.getByRole('checkbox', { name: 'indigo' }));
  expect(screen.queryByText('SVG migration review')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'indigo' }));
  fireEvent.click(screen.getByText('SVG migration review'));
  expect(screen.getByPlaceholderText('Add a location')).toHaveValue('Meeting room');
  fireEvent.change(screen.getByPlaceholderText('Add Title'), { target: { value: 'Migration approved' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Migration approved')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('savedEvents'))[0].title).toBe('Migration approved');

  fireEvent.click(screen.getByText('Migration approved'));
  fireEvent.click(screen.getByText('delete'));
  expect(screen.queryByText('Migration approved')).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('savedEvents'))).toEqual([]);
});
