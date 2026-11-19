import inspect
from data_source import mock_order_generator
from exporter import stream_csv_rows
from streamer import MockSink, write_stream_to_sink


def test_is_generator():
    gen = stream_csv_rows(mock_order_generator(2))
    assert inspect.isgenerator(gen), "stream_csv_rows must be a Python generator using 'yield'"


def test_header_first():
    gen = stream_csv_rows(mock_order_generator(3))
    header = next(gen)
    assert header == "id,customer_id,amount,status"


def test_row_formatting():
    gen = stream_csv_rows(mock_order_generator(2))
    header = next(gen)
    row1 = next(gen)
    assert row1 == "1,cust_1,11.50,pending"
    row2 = next(gen)
    assert row2 == "2,cust_2,12.50,completed"


def test_stream_sink_integration():
    sink = MockSink()
    stream = stream_csv_rows(mock_order_generator(10))
    total_written = write_stream_to_sink(stream, sink)

    # 1 header + 10 rows = 11 chunks
    assert total_written == 11
    assert sink.chunks[0] == "id,customer_id,amount,status\n"
