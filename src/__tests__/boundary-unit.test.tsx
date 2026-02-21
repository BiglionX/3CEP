import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import LikeButton from '../components/LikeButton';
import UploadForm from '../components/UploadForm';
import SearchResults from '../components/SearchResults';
import ScheduleForm from '../components/ScheduleForm';

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('边界情况单元测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('点赞功能测试', () => {
    test('TC-001: 点赞3次触发草稿创建', async () => {
      const mockOnLike = jest.fn();
      const mockOnDraftCreate = jest.fn();
      
      render(
        <LikeButton
          initialLikes={2}
          contentId="test-content-1"
          onLike={mockOnLike}
          onDraftCreate={mockOnDraftCreate}
        />
      );
      
      // 第3次点赞
      fireEvent.click(screen.getByTestId('like-button'));
      
      expect(mockOnLike).toHaveBeenCalledWith(3);
      expect(mockOnDraftCreate).toHaveBeenCalledWith('test-content-1');
      expect(toast.success).toHaveBeenCalledWith('内容已添加到草稿箱！');
    });

    test('TC-002: 超过3次点赞不重复触发', async () => {
      const mockOnDraftCreate = jest.fn();
      
      const { rerender } = render(
        <LikeButton
          initialLikes={3}
          contentId="test-content-1"
          onDraftCreate={mockOnDraftCreate}
        />
      );
      
      // 第4次点赞
      fireEvent.click(screen.getByTestId('like-button'));
      rerender(
        <LikeButton
          initialLikes={4}
          contentId="test-content-1"
          onDraftCreate={mockOnDraftCreate}
        />
      );
      
      // 再次点击
      fireEvent.click(screen.getByTestId('like-button'));
      
      expect(mockOnDraftCreate).toHaveBeenCalledTimes(0);
      expect(screen.getByTestId('like-button')).toBeDisabled();
    });

    test('TC-003: 快速连续点赞防抖测试', async () => {
      const user = userEvent.setup();
      const mockOnDraftCreate = jest.fn();
      
      render(
        <LikeButton
          initialLikes={2}
          contentId="test-content-1"
          onDraftCreate={mockOnDraftCreate}
        />
      );
      
      // 快速点击3次
      await user.dblClick(screen.getByTestId('like-button'));
      await user.click(screen.getByTestId('like-button'));
      
      // 等待防抖结束
      await waitFor(() => {
        expect(mockOnDraftCreate).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });

  describe('URL上传测试', () => {
    const existingUrls = [
      'https://example.com/content1',
      'https://github.com/project',
      'HTTPS://EXAMPLE.COM/CONTENT1' // 大小写变体
    ];

    test('TC-004: 重复URL检测', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      
      render(<UploadForm existingUrls={existingUrls} onUploadSuccess={mockOnSuccess} />);
      
      // 测试完全相同的URL
      await user.type(screen.getByTestId('url-input'), 'https://example.com/content1');
      await user.click(screen.getByTestId('submit-button'));
      
      expect(toast.error).toHaveBeenCalledWith('该URL已存在，请勿重复上传');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test('TC-005: 大小写敏感性测试', async () => {
      const user = userEvent.setup();
      
      render(<UploadForm existingUrls={existingUrls} />);
      
      // 测试大小写不同的URL
      await user.type(screen.getByTestId('url-input'), 'https://EXAMPLE.COM/CONTENT1');
      await user.click(screen.getByTestId('submit-button'));
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    test('TC-006: URL格式验证', async () => {
      const user = userEvent.setup();
      
      render(<UploadForm existingUrls={[]} />);
      
      // 测试无效URL
      await user.type(screen.getByTestId('url-input'), 'invalid-url-format');
      await user.click(screen.getByTestId('submit-button'));
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('请输入有效的URL格式');
    });
  });

  describe('搜索功能测试', () => {
    test('TC-007: 无结果友好提示', () => {
      render(<SearchResults results={[]} searchTerm="test-search" />);
      
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      expect(screen.getByText('未找到相关内容')).toBeInTheDocument();
      expect(screen.getByTestId('suggestions')).toBeInTheDocument();
      expect(screen.getByTestId('suggestions')).toHaveTextContent('您可以尝试');
    });

    test('TC-008: 特殊字符处理', () => {
      render(<SearchResults results={[]} searchTerm="!@#$%^&*()" />);
      
      expect(screen.getByText('未找到相关内容')).toBeInTheDocument();
      expect(screen.getByText('!@#$%^&*()')).toBeInTheDocument();
    });

    test('TC-009: 正常结果显示', () => {
      const mockResults = [
        {
          id: '1',
          title: '测试标题',
          url: 'https://example.com',
          excerpt: '测试摘要内容'
        }
      ];
      
      render(<SearchResults results={mockResults} searchTerm="test" />);
      
      expect(screen.getByText('找到 1 个相关结果')).toBeInTheDocument();
      expect(screen.getByText('测试标题')).toBeInTheDocument();
    });
  });

  describe('预约功能测试', () => {
    const mockSlots = [
      {
        id: 'slot-1',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00')
      },
      {
        id: 'slot-2',
        start: new Date('2024-01-15T11:00:00'),
        end: new Date('2024-01-15T12:00:00')
      }
    ];

    const conflictingSlots = [
      {
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T11:00:00')
      }
    ];

    test('TC-010: 时间冲突检测', () => {
      render(
        <ScheduleForm
          availableSlots={mockSlots}
          conflictingSlots={conflictingSlots}
        />
      );
      
      fireEvent.click(screen.getByTestId('slot-1000-1100'));
      
      expect(screen.getByTestId('conflict-error')).toBeInTheDocument();
      expect(screen.getByTestId('conflict-error')).toHaveTextContent('时间冲突');
    });

    test('TC-011: 边界时间测试', () => {
      const boundaryConflicts = [
        {
          start: new Date('2024-01-15T10:00:00'),
          end: new Date('2024-01-15T11:00:00')
        }
      ];
      
      render(
        <ScheduleForm
          availableSlots={mockSlots}
          conflictingSlots={boundaryConflicts}
        />
      );
      
      // 测试部分重叠的情况
      fireEvent.click(screen.getByTestId('slot-1030-1130'));
      
      expect(screen.getByTestId('conflict-error')).toBeInTheDocument();
    });

    test('TC-012: 连续时间段预约', () => {
      const mockOnSchedule = jest.fn();
      
      render(
        <ScheduleForm
          availableSlots={mockSlots}
          conflictingSlots={[]}
          onSchedule={mockOnSchedule}
        />
      );
      
      fireEvent.click(screen.getByTestId('slot-1100-1200'));
      fireEvent.click(screen.getByText('确认预约'));
      
      expect(mockOnSchedule).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('预约成功！');
    });
  });
});